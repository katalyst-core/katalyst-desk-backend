import { Injectable } from '@nestjs/common';

import { WAMessage } from 'src/module/channel/whatsapp/whatsapp.type';
import { ChannelMessage } from './channel.type';

@Injectable()
export class ChannelService {
  constructor() {}

  transformRaw(data: WAMessage | any): ChannelMessage | null {
    if (data satisfies WAMessage) {
      return {
        body: data.text.body,
      };
    }

    return null;
  }
}
