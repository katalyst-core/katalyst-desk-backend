import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BasicStrategy } from './strategy/basic.strategy';
import { JWTAccessStrategy } from './strategy/jwt-access.strategy';
import { JWTRefreshStrategy } from './strategy/jwt-refresh.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    BasicStrategy,
    JWTAccessStrategy,
    JWTRefreshStrategy,
  ],
})
export class AuthModule {}
