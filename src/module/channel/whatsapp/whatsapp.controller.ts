import {
  All,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UUID } from 'crypto';

import { WhatsAppService } from './whatsapp.service';
import { WhatsAppAuthDTO } from './dto/whatsapp-auth-dto';
import { ChannelService } from '../channel.service';
import { ApiConfigService } from 'src/config/api-config.service';
import { Agent } from 'src/common/decorator/param';
import { JWTAccess } from 'src/module/auth/strategy/jwt-access.strategy';
import { GuardService } from 'src/util/guard.service';
import { WhatsAppWebhookSchema } from './whatsapp.schema';

@Controller('channel/whatsapp')
export class WhatsAppController {
  constructor(
    private readonly config: ApiConfigService,
    private readonly guard: GuardService,
    private readonly whatsAppService: WhatsAppService,
    private readonly channelService: ChannelService,
  ) {}

  @All('webhook')
  verifyWebhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.header('x-hub-signature-256');
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];
    const rawBody = JSON.stringify(req.body);

    const webhookToken = this.config.getWhatsAppWebhookToken;
    const facebookSecret = this.config.getFacebookClientSecret;

    if (
      !rawBody ||
      !signature ||
      !this.channelService.verifySHA256(rawBody, signature, facebookSecret)
    ) {
      throw new UnauthorizedException();
    }

    console.log('whatsapp:', JSON.stringify(req.body));

    if (mode === 'subscribe' && webhookToken === verifyToken) {
      return res.send(challenge);
    }

    const content = req.body;

    if (!content) return;

    const result = WhatsAppWebhookSchema.safeParse(content);
    if (!result.success) return;

    this.whatsAppService.handleMessage(result.data);

    res.sendStatus(200);
  }

  @UseGuards(JWTAccess)
  @Post('auth')
  async authenticateChannel(
    @Agent() agentId: UUID,
    @Body() data: WhatsAppAuthDTO,
  ) {
    const { organization_id, phone_number_id, waba_id, code } = data;

    await this.guard.isOrganizationOwner(agentId, organization_id);
    await this.whatsAppService.authenticateChannel(
      phone_number_id,
      waba_id,
      code,
      organization_id,
    );

    return {
      code: 200,
      message: 'Successfully authenticated WhatsApp',
    };
  }
}
