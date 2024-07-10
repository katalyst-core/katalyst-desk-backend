import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { JWTAccessStrategy } from './strategy/jwt-access.strategy';
import { JWTRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { JWTLogoutStrategy } from './strategy/jwt-logout.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    LocalStrategy,
    JWTAccessStrategy,
    JWTRefreshStrategy,
    JWTLogoutStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
