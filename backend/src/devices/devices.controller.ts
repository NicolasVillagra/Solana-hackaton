import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  register(@Body() registerDeviceDto: RegisterDeviceDto) {
    return this.devicesService.registerDevice(registerDeviceDto);
  }

  @Get(':id')
  getDevice(@Param('id') id: string) {
    return this.devicesService.getDevice(id);
  }
}
