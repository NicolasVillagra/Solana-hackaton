import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnergyReportDto {
  @ApiProperty({
    description: 'Device identifier that generated the energy',
    example: 'SOLAR-PANEL-001'
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  /**
   * Energy generated in Megawatt-hours.
   * Must be a positive value.
   */
  @ApiProperty({
    description: 'Energy generated in Kilowatt-hours (kWh)',
    example: 1.5,
    minimum: 0.0001
  })
  @IsNumber()
  @Min(0.0001)
  kwh: number;
}
