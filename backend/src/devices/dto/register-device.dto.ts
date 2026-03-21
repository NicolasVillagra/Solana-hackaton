import { IsString, IsNotEmpty, IsLowercase, Length } from 'class-validator';

export class RegisterDeviceDto {
  /**
   * The public key of the device owner.
   * @example "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
   */
  @IsString()
  @IsNotEmpty()
  @Length(32, 44)
  ownerWallet: string;

  /**
   * Unique hardware identifier for the device.
   */
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  /**
   * Physical location of the energy asset.
   */
  @IsString()
  @IsNotEmpty()
  location: string;
}
