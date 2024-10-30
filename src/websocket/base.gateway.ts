import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UUID } from 'crypto';
import { Server } from 'socket.io';
import { WsTypes } from './websocket.type';
import { ResponseDTO } from 'src/common/dto/response-dto';
import { UtilService } from 'src/util/util.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { AllExceptionWsFilter } from 'src/common/filter/all-exception-ws.filter';

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
      _data = UtilService.TransformDTO(data, dto);
    }
    this.server.to(`agent_${agentId}`).emit(type, _data);
  }
}
