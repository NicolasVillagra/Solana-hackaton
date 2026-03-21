import { Controller, Post, Body, Logger, NotFoundException } from '@nestjs/common';
import { EnergyService } from './energy.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnergyReportDto } from './dto/create-report.dto';

@Controller('energy')
export class EnergyController {
  private readonly logger = new Logger(EnergyController.name);

  constructor(
    private readonly energyService: EnergyService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('report')
  async handleReport(@Body() createReportDto: CreateEnergyReportDto) {
    const { deviceId, mwh } = createReportDto;
    this.logger.log(`Received energy report for device ${deviceId}: ${mwh} MWh`);
    
    const device = await this.prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not registered`);
    }

    const co2Saved = this.energyService.calculateCO2(mwh);
    
    // Save to database
    const savedReport = await this.prisma.energyReport.create({
      data: {
        deviceId,
        mwh,
        co2Saved,
      },
    });

    // Trigger Solana Minting using SolanaService
    let txHash: string | null = null;
    try {
      txHash = await this.energyService.processOnChainMinting(deviceId, mwh, co2Saved);
      
      // Update Prisma with TX Hash
      await this.prisma.energyReport.update({
        where: { id: savedReport.id },
        data: { txHash },
      });
    } catch (e) {
      this.logger.error(`Blockchain sync failed for report ${savedReport.id}: ${e.message}`);
    }
    
    return {
      status: 'PROCESSED',
      reportId: savedReport.id,
      co2Saved,
      solanaTx: txHash,
    };
  }
}
