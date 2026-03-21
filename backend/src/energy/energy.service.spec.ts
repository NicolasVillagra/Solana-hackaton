import { Test, TestingModule } from '@nestjs/testing';
import { EnergyService } from './energy.service';
import { SolanaService } from '../solana/solana.service';

describe('EnergyService', () => {
  let service: EnergyService;
  let solanaService: SolanaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnergyService,
        {
          provide: SolanaService,
          useValue: {
            mintREC: jest.fn().mockResolvedValue('fake-tx-hash'),
          },
        },
      ],
    }).compile();

    service = module.get<EnergyService>(EnergyService);
    solanaService = module.get<SolanaService>(SolanaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate CO2 correctly (1 MWh = 0.475 Tonnes)', () => {
    const mwh = 10;
    const expectedCo2 = 4.75;
    expect(service.calculateCO2(mwh)).toBe(expectedCo2);
  });

  it('should call SolanaService for minting', async () => {
    const deviceId = 'test-device';
    const mwh = 1;
    const co2 = 0.475;
    await service.processOnChainMinting(deviceId, mwh, co2);
    expect(solanaService.mintREC).toHaveBeenCalledWith(deviceId, mwh, co2);
  });
});
