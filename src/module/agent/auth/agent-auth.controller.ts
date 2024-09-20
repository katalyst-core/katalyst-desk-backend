import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AgentBasicAuth, AgentRefresh } from '../agent.type';
import { NewAgentDTO } from '../dto/new-agent-dto';
import { AgentAuthService } from './agent-auth.service';
import { AgentBasicGuard } from '../strategy/agent-basic.strategy';
import { AgentJWTRefresh } from '../strategy/agent-jwt-refresh.strategy';

@Controller('agent/auth')
export class AgentAuthController {
  constructor(private readonly authService: AgentAuthService) {}

  @Post('create')
  async create(@Body() data: NewAgentDTO) {
    await this.authService.createAgent(data);

    return {
      status: HttpStatus.CREATED,
      message: 'Success created an account',
    };
  }

  @UseGuards(AgentBasicGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { Refresh } = req.cookies;
    if (Refresh) {
      throw new UnauthorizedException({
        message: 'User is already logged in',
        code: 'USER_IS_LOGGED_IN',
      });
    }

    const user = req.user as AgentBasicAuth;
    const { agentId } = user;

    const tokens = await Promise.all([
      this.authService.createAccessToken(agentId),
      this.authService.createRefreshToken(agentId),
    ]);

    tokens.forEach((token) => {
      const { name, value, options } = token;
      res.cookie(name, value, options);
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully logged in',
    };
  }

  @UseGuards(AgentJWTRefresh)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AgentRefresh;
    const { agentId, sessionId } = user;

    const tokens = await Promise.all([
      this.authService.createAccessToken(agentId),
      this.authService.createRefreshToken(agentId, sessionId),
    ]);

    tokens.forEach((token) => {
      const { name, value, options } = token;
      res.cookie(name, value, options);
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully refreshed tokens',
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const cookieNames = ['Authentication', 'Refresh'];
    cookieNames.forEach((name) => {
      const value = '';
      const options = {
        maxAge: 0,
      };
      res.cookie(name, value, options);
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully logged out',
    };
  }
}
