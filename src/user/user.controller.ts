import { Controller, Get, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { JWTAccess } from 'src/auth/strategy/jwt-access.strategy';
import { AccessUser } from 'src/auth/auth.type';
import { User } from 'src/decorator/User';

@UseGuards(JWTAccess)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  async getUserInfo(@User() user: AccessUser) {
    const { userId } = user;

    const userInfo = await this.userService.getUserInfo(userId);

    return {
      message: 'Successfully retrieved used info',
      data: userInfo,
    };
  }
}
