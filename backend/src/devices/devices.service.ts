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

  /**
   * Helper to hash secrets for production grade security
   */
  private hashSecret(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  async registerDevice(dto: RegisterDeviceDto & { secret: string }) {
    const { ownerWallet, deviceId, location, secret } = dto;
    
    const secretHash = this.hashSecret(secret || `default-${deviceId}`);

    // 🔴 AUDIT V2 FIX: Validate Solana PublicKey
    try {
      new PublicKey(ownerWallet);
    } catch (e) {
      throw new BadRequestException('Invalid Solana Owner Wallet address');
    }

    // 🔴 AUDIT V2 FIX: Derive PDA Address
    const [pdaAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('device'), Buffer.from(deviceId)],
      new PublicKey(process.env.SOLANA_PROGRAM_ID || '8UF83GAK1UZ3vS3wxuqa2bMEgJ2QfvUaS3EQsM5i5oaR')
    );

    this.logger.log(`Registering device ${deviceId} with PDA: ${pdaAddress.toBase58()}`);

    return this.prisma.device.create({
      data: {
        deviceId,
        ownerWallet, // Storing for local records
        secretHash,  // 🔴 AUDIT V2.1: Protected Secret
        location,
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
