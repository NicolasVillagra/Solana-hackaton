import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateEnergyReportDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  /**
   * Energy generated in Megawatt-hours.
   * Must be a positive value.
   */
  @IsNumber()
  @Min(0.0001)
  mwh: number;
}
