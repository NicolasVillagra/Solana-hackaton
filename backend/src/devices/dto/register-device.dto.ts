import { IsString, IsNotEmpty, IsLowercase, Length, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceDto {
  /**
   * The public key of the device owner.
   * 🔴 AUDIT V2 FIX: Must be a valid Solana Base58 string (32-44 chars).
   * @example "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
   */
  @ApiProperty({
    description: 'Solana wallet address of the device owner (Base58 format)',
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    minLength: 32,
    maxLength: 44
  })
  @IsString()
  @IsNotEmpty()
  @Length(32, 44)
  ownerWallet: string;

  /**
   * Unique hardware identifier for the device.
   */
  @ApiProperty({
    description: 'Unique hardware identifier for the device',
    example: 'SOLAR-PANEL-001'
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  /**
   * Physical location of the energy asset.
   */
  @ApiProperty({
    description: 'Physical location of the energy asset',
    example: 'Caracas, Venezuela'
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Device name',
    example: 'Solar Panel Array'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Device serial number',
    example: 'SN-2024-001'
  })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({
    description: 'Device brand/manufacturer',
    example: 'SunPower'
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    description: 'Device capacity in kilowatts (kW)',
    example: 5.5,
    minimum: 0.1
  })
  @IsNumber()
  @Min(0.1)
  capacityKw: number;

  /**
   * Secret for device authentication (hashed on server).
   */
  @ApiProperty({
    description: 'Secret key for device authentication (will be hashed on server)',
    example: 'device-secret-key-123'
  })
  @IsString()
  @IsNotEmpty()
  secret: string;
}
