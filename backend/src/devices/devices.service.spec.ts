import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { PrismaService } from '../prisma/prisma.service';
import { SolanaService } from '../solana/solana.service';
import { BadRequestException } from '@nestjs/common';

describe('DevicesService', () => {
  let service: DevicesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: PrismaService,
          useValue: {
            device: {
              create: jest.fn().mockResolvedValue({ deviceId: 'test-123' }),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: SolanaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException for invalid ownerWallet', async () => {
    const dto = {
      ownerWallet: 'invalid-pk',
      deviceId: 'iot-001',
      location: 'Spain',
    };
    await expect(service.registerDevice(dto)).rejects.toThrow(BadRequestException);
  });

  it('should register a device for valid wallet', async () => {
    const dto = {
      ownerWallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      deviceId: 'iot-001',
      location: 'Spain',
    };
    const result = await service.registerDevice(dto);
    expect(result.deviceId).toBe('test-123');
    expect(prisma.device.create).toHaveBeenCalled();
  });
});
