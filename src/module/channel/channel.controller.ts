import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JWTAccess } from '../auth/strategy/jwt-access.strategy';
import { ChannelService } from './channel.service';
import { ChannelAccountsDTO } from './dto/channel-accounts-dto';
import { AgentAccess } from '../auth/auth.type';
import { ChannelAccountsResponseDTO } from './dto/channel-accounts-response';
import { DeleteChannelAccountDTO } from './dto/delete-channel-account-dto';

@UseGuards(JWTAccess)
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('accounts')
  async getChannelAccounts(
    @Req() req: Request,
    @Query() data: ChannelAccountsDTO,
  ) {
    const { organization_id: orgId } = data;

    const user = req.user as AgentAccess;
    const { agentId } = user;

    const accounts = await this.channelService.getChannelAccountsByOrgId(
      orgId,
      agentId,
    );

    return {
      code: 200,
      message: 'Successfully retrieved channel accounts',
      data: accounts,
      options: {
        dto: ChannelAccountsResponseDTO,
      },
    };
  }

  @Delete('account')
  async deleteChannelAccountById(
    @Req() req: Request,
    @Body() data: DeleteChannelAccountDTO,
  ) {
    const { channel_account_id: channelId } = data;

    const user = req.user as AgentAccess;
    const { agentId } = user;

    await this.channelService.deleteAccountById(channelId, agentId);

    return {
      code: 200,
      message: 'Successfully deleted channel account',
    };
  }
}
