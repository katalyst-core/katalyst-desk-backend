import { Controller, Get } from '@nestjs/common';
import { ApiConfigService } from './config/api-config.service';

@Controller()
export class AppController {
  constructor(private readonly config: ApiConfigService) {}

  // @Get()
  // async getPing() {}
}
