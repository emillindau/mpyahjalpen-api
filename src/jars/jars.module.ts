import { Module } from '@nestjs/common';
import { JarsService } from './jars.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [JarsService],
})
export class JarsModule {}
