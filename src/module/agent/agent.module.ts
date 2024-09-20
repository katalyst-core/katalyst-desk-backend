import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AgentAuthController } from './auth/agent-auth.controller';
import { AgentController } from './agent.controller';

import { AgentAuthService } from './auth/agent-auth.service';
import { AgentService } from './agent.service';

import { AgentBasicStrategy } from './strategy/agent-basic.strategy';
import { AgentJWTAccessStrategy } from './strategy/agent-jwt-access.strategy';
import { AgentJWTRefreshStrategy } from './strategy/agent-jwt-refresh.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AgentAuthController, AgentController],
  providers: [
    AgentAuthService,
    AgentBasicStrategy,
    AgentJWTAccessStrategy,
    AgentJWTRefreshStrategy,
    AgentService,
  ],
})
export class AgentModule {}
