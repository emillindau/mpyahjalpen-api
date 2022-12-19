import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { PrismaService } from 'src/prisma.service';
import { RafflesService } from 'src/raffles/raffles.service';

@Module({
  controllers: [DonationsController],
  providers: [DonationsService, PrismaService, RafflesService],
})
export class DonationsModule {}
