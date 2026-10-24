import { Module } from '@nestjs/common';
import { DetectModule } from './detect/detect.module';
import { HealthController } from './health.controller';

@Module({
  imports: [DetectModule],
  controllers: [HealthController],
})
export class AppModule {}
