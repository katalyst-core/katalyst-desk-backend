import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { UserService } from './user.service';
import { JWTAccess } from 'src/auth/strategy/jwt-access.strategy';
import { AccessUser } from 'src/auth/auth.type';

@UseGuards(JWTAccess)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  async getUserInfo(@Req() req: Request) {
    const user = req.user as AccessUser;
    const { publicId } = user;

    const userInfo = await this.userService.getUserInfo(publicId);

    return {
      message: 'Successfully retrieved used info',
      data: userInfo,
    };
  }
}
