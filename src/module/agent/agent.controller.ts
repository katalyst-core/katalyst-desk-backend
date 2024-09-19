import { Controller, Post } from '@nestjs/common';

@Controller('agent')
export class AgentController {
  @Post('create')
  async create() {}

  @Post('login')
  async login() {}

  @Post('refresh')
  async refresh() {}

  @Post('logout')
  async logout() {}
}
