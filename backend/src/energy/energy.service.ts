import { Injectable, Logger } from '@nestjs/common';
import { SolanaService } from '../solana/solana.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class EnergyService {
  private readonly logger = new Logger(EnergyService.name);
  
  // 1 MWh = 0.475 Tonnes CO2
  private readonly CO2_PER_MWH = new BigNumber(0.475);

  constructor(private readonly solanaService: SolanaService) {}

  calculateCO2(mwh: number): number {
    return new BigNumber(mwh).multipliedBy(this.CO2_PER_MWH).toNumber();
  }

  /**
   * 🏁 SYNC CON NICO: Ejecuta el flujo dual (RECs + Energía Líquida)
   */
  async processOnChainMinting(deviceId: string, mwh: number, co2Saved: number, recipientWallet: string): Promise<string> {
    this.logger.log(`⚡ Iniciando flujo DUAL para ${deviceId} -> ${recipientWallet}`);
    
    // 1. Mintear Certificado Inmutable (REC) en Token-2022
    const recTx = await this.solanaService.mintREC(deviceId, mwh, recipientWallet);
    this.logger.log(`✅ Certificado (REC) emitido: ${recTx}`);

    // 2. Mintear Energía Líquida (kW) convertible/negociable (SPL Standard)
    // 1 MWh = 1000 kW (Ajustable segun politica del proyecto)
    const kwAmount = mwh * 1000;
    const energyTx = await this.solanaService.mintEnergy(kwAmount, recipientWallet);
    this.logger.log(`✅ Energía líquida (kW) emitida: ${energyTx}`);

    // Retorna el hash del REC como referencia principal
    return recTx;
  }
}
