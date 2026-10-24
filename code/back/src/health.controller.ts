import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ML_MOCK } from './constants';
import { Health } from './types';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  check(): Health {
    return { status: 'ok', mlMock: ML_MOCK };
  }
}
