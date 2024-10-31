import { Injectable } from '@nestjs/common';
import { Database } from 'src/database/database';
import { ChannelGateway } from '../channel.gateway';
import { ChannelService } from '../channel.service';

@Injectable()
export class InstagramService {
  constructor(
    private readonly db: Database,
    private readonly channelService: ChannelService,
    private readonly gateway: ChannelGateway,
  ) {}

  async handleMessage() {}
}
