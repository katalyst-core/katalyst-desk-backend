import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionWsFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const args = host.getArgs();
    // event ack callback
    const ACKCallback = args.reverse().find((a) => 'function' === typeof a);
    if (ACKCallback) {
      ACKCallback({ error: exception.message, exception });
    }
  }
}
