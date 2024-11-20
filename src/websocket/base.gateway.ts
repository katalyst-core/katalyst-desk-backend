import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UUID } from 'crypto';
import { Server } from 'socket.io';

import { transformDTO } from '@util/.';
import { ResponseDTO } from '@dto/response-dto';
import { AllExceptionWsFilter } from '@filter/all-exception-ws.filter';

import { WsTypes } from './websocket.type';

@WebSocketGateway()
@UsePipes(
  new ValidationPipe({
    transform: true,
    exceptionFactory() {
      return new WsException('Bad request');
    },
  }),
)
@UseFilters(AllExceptionWsFilter)
export class BaseGateway {
  @WebSocketServer()
  server: Server;

  sendAgent<T extends ResponseDTO = any>(
    agentId: UUID,
    type: WsTypes,
    data: T,
    dto?: { new (...args: any[]): T },
  ) {
    let _data: any = data;
    if (dto) {
      _data = transformDTO(data, dto);
    }
    this.server.to(`agent_${agentId}`).emit(type, _data);
  }
}
