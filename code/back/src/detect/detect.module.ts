import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ML_TIMEOUT_MS } from '../constants';
import { DetectController } from './detect.controller';
import { DetectService } from './detect.service';

@Module({
  imports: [HttpModule.register({ timeout: ML_TIMEOUT_MS })],
  controllers: [DetectController],
  providers: [DetectService],
})
export class DetectModule {}
