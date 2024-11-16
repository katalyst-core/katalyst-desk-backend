import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { BaseGateway } from './base.gateway';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [BaseGateway, WebsocketGateway, WebsocketService],
  exports: [BaseGateway, WebsocketService],
})
export class WebsocketModule {}
