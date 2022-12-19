import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { DonationsService } from 'src/donations/donations.service';
import { JarsService } from 'src/jars/jars.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma.service';
import { RafflesService } from 'src/raffles/raffles.service';

@Module({
  imports: [HttpModule],
  providers: [
    TasksService,
    DonationsService,
    JarsService,
    PrismaService,
    RafflesService,
  ],
})
export class TasksModule {}
