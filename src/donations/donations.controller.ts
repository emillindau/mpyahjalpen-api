import { Controller, Get } from '@nestjs/common';
import { DonationsService } from './donations.service';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}
  @Get()
  findAll() {
    return this.donationsService.findAll();
  }

  @Get('stats')
  find() {
    return this.donationsService.stats();
  }
}
