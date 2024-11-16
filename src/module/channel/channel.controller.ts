import { Controller, Delete, UseGuards } from '@nestjs/common';
import { UUID } from 'crypto';

import { ParamUUID } from '@decorator/param';
import { PermGuard } from '@decorator/route';
import { JWTAccess } from '@module/auth/strategy/jwt-access.strategy';

import { ChannelService } from './channel.service';

@UseGuards(JWTAccess)
@Controller('/channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @PermGuard('channel.delete')
  @Delete('/:channelId')
  async deleteChannel(@ParamUUID('channelId') channelId: UUID) {
    await this.channelService.deleteAccountById(channelId);

    return {
      code: 200,
      message: 'Successfully deleted channel account',
    };
  }
}
