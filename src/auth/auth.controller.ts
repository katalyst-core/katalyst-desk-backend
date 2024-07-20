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

import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user-dto';
import { LocalGuard } from './strategy/local.strategy';
import { LocalUser, RefreshUser } from './auth.type';
import { JWTRefresh } from './strategy/jwt-refresh.strategy';
import { JWTLogout } from './strategy/jwt-logout.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create')
  async create(@Body() data: CreateUserDTO) {
    await this.authService.createUser(data);

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully created an account',
    };
  }

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { Refresh } = req.cookies;
    if (Refresh) {
      throw new UnauthorizedException('User is already logged in');
    }

    const user = req.user as LocalUser;
    const { userId } = user;

    const tokens = await Promise.all([
      this.authService.createAccessToken(userId),
      this.authService.createRefreshToken(userId),
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

  @UseGuards(JWTRefresh)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as RefreshUser;
    const { userId, sessionToken } = user;

    const tokens = await Promise.all([
      this.authService.createAccessToken(userId),
      this.authService.createRefreshToken(userId, sessionToken),
    ]);

    tokens.forEach((token) => {
      const { name, value, options } = token;
      res.cookie(name, value, options);
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully refreshed the access token',
    };
  }

  @UseGuards(JWTLogout)
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
