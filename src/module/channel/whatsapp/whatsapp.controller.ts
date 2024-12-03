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

import { Agent } from '@decorator/param';
import { GuardService } from 'src/guard/guard.service';
import { JWTAccess } from '@module/auth/strategy/jwt-access.strategy';
import { CHANNEL_MANAGE } from '@guard/permissions';

import { WhatsAppService } from './whatsapp.service';
import { WhatsAppAuthDTO } from './dto/whatsapp-auth-dto';
import { ApiConfigService } from 'src/config/api-config.service';
import { WhatsAppWebhookSchema } from './whatsapp.schema';
import { ChannelService } from '../channel.service';

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

    this.channelService.logEvent(
      'whatsapp',
      content,
      !result.success ? JSON.parse(JSON.stringify(result.error)) : undefined,
      result.success,
    );

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

    const hasAccess = await this.guard.hasAccessToOrganization(
      [CHANNEL_MANAGE],
      agentId,
      organization_id,
    );

    if (!hasAccess) {
      throw new UnauthorizedException({
        message: 'Invalid Access',
        code: 'INVALID_ACCESS',
      });
    }

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
