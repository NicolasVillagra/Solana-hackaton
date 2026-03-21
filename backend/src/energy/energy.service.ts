import { Injectable, Logger } from '@nestjs/common';
import { SolanaService } from '../solana/solana.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class EnergyService {
  private readonly logger = new Logger(EnergyService.name);
  
  // 1 MWh = 0.475 Tonnes CO2 -> 1 kWh = 0.000475 Tonnes CO2
  private readonly CO2_PER_KWH = new BigNumber(0.000475);

  constructor(private readonly solanaService: SolanaService) {}

  calculateCO2(kwh: number): number {
    return new BigNumber(kwh).multipliedBy(this.CO2_PER_KWH).toNumber();
  }

  /**
   * 🏁 SYNC CON NICO: Ejecuta el flujo dual (RECs + Energía Líquida)
   */
  async processOnChainMinting(deviceId: string, kwh: number, co2Saved: number, recipientWallet: string): Promise<string> {
    this.logger.log(`⚡ Iniciando flujo DUAL para ${deviceId} -> ${recipientWallet}`);
    
    // 1. Mintear Certificado Inmutable (REC) en Token-2022
    // Convertimos kWh a MWh para el certificado si es necesario, 
    // o usamos kWh directamente si el contrato lo acepta como unidad base.
    const recTx = await this.solanaService.mintREC(deviceId, kwh, recipientWallet);
    this.logger.log(`✅ Certificado (REC) emitido: ${recTx}`);

    // 2. Mintear Energía Líquida (kW) convertible/negociable (SPL Standard)
    // 1 kWh = 1 kW token (Relación 1:1 para máxima precisión)
    const kwAmount = kwh;
    const energyTx = await this.solanaService.mintEnergy(kwAmount, recipientWallet);
    this.logger.log(`✅ Energía líquida (kW) emitida: ${energyTx}`);

    // Retorna el hash del REC como referencia principal
    return recTx;
  }
}
