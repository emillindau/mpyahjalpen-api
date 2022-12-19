import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RafflesService } from './raffles.service';

@Module({
  providers: [RafflesService, PrismaService],
})
export class RafflesModule {}
