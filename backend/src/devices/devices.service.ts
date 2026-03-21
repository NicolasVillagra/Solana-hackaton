import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { SolanaService } from '../solana/solana.service';
import { PublicKey } from '@solana/web3.js';
import * as crypto from 'crypto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    private prisma: PrismaService,
    private solanaService: SolanaService,
  ) {}

  private hashSecret(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  async registerDevice(dto: RegisterDeviceDto & { secret: string }) {
    const { ownerWallet, deviceId, location, secret, name, serialNumber, brand, capacityKw } = dto;
    const secretHash = this.hashSecret(secret || `default-${deviceId}`);

    try {
      new PublicKey(ownerWallet);
    } catch (e) {
      throw new BadRequestException('Invalid Solana Owner Wallet address');
    }

    this.logger.log(`Registering device ${deviceId} locally with detailed metadata.`);

    // 🏁 SYNC CON NICO: Registro On-Chain Real
    try {
      await this.solanaService.registerDeviceOnChain({
        ownerWallet,
        deviceId,
        name,
        serialNumber,
        brand,
        location,
        capacityKw,
      });
    } catch (e) {
      this.logger.warn(`On-chain registration failed for ${deviceId}, but saved locally: ${e.message}`);
    }

    return this.prisma.device.create({
      data: {
        deviceId,
        name,
        serialNumber,
        brand,
        ownerWallet,
        secretHash,
        location,
        capacityKw,
        status: 'ACTIVE',
      },
    });
  }

  async getDevice(deviceId: string) {
    return this.prisma.device.findUnique({
      where: { deviceId },
    });
  }
}
