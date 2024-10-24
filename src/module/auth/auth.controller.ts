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

import { AgentBasicAuth, AgentRefresh } from './auth.type';
import { NewAgentDTO } from './dto/new-agent-dto';
import { AuthService } from './auth.service';
import { BasicGuard } from './strategy/basic.strategy';
import { JWTRefresh } from './strategy/jwt-refresh.strategy';
import { AccessTokenResponseDTO } from './dto/access-token-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create')
  async create(@Body() data: NewAgentDTO) {
    await this.authService.createAgent(data);

    return {
      status: HttpStatus.CREATED,
      message: 'Success created an account',
    };
  }

  @UseGuards(BasicGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const Refresh = req.cookies['katalyst-desk-refresh'];
    if (Refresh) {
      throw new UnauthorizedException({
        message: 'User is already logged in',
        code: 'USER_IS_LOGGED_IN',
      });
    }

    const user = req.user as AgentBasicAuth;
    const { agentId } = user;

    const { name, value, options } =
      await this.authService.createRefreshToken(agentId);
    res.cookie(name, value, options);

    const accessToken = this.authService.createAccessToken(agentId);

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully logged in',
      data: {
        accessToken,
      },
      options: {
        dto: AccessTokenResponseDTO,
      },
    };
  }

  @UseGuards(JWTRefresh)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AgentRefresh;
    const { agentId, sessionToken } = user;

    const { name, value, options } = await this.authService.createRefreshToken(
      agentId,
      sessionToken,
    );
    res.cookie(name, value, options);

    const accessToken = this.authService.createAccessToken(agentId);

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully refreshed tokens',
      data: {
        accessToken,
      },
      options: {
        dto: AccessTokenResponseDTO,
      },
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const cookieNames = ['katalyst-desk-refresh'];
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
