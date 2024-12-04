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
import { CHANNEL_MANAGE } from '@guard/permissions';
import { GuardService } from 'src/guard/guard.service';
import { ApiConfigService } from '@config/api-config.service';
import { JWTAccess } from '@module/auth/strategy/jwt-access.strategy';

import { InstagramWebhookSchema } from './instagram.schema';
import { InstagramService } from './instagram.service';
import { InstagramCodeDTO } from './dto/instagram-code-dto';
import { ChannelService } from '../channel.service';

@Controller('channel/instagram')
export class InstagramController {
  constructor(
    private readonly config: ApiConfigService,
    private readonly instagramService: InstagramService,
    private readonly channelService: ChannelService,
    private readonly guard: GuardService,
  ) {}

  @All('webhook')
  webhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.header('x-hub-signature-256');
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];
    const rawBody = JSON.stringify(req.body);

    const webhookToken = this.config.getInstagramWebhookToken;
    const instagramSecret = this.config.getInstagramAppSecret;

    if (
      !rawBody ||
      !signature ||
      !this.channelService.verifySHA256(rawBody, signature, instagramSecret)
    ) {
      throw new UnauthorizedException();
    }

    console.log('instagram: ', rawBody);

    if (mode === 'subscribe' && webhookToken === verifyToken) {
      return res.send(challenge);
    }

    const content = req.body;

    if (!content) {
      return null;
    }

    const result = InstagramWebhookSchema.safeParse(content);

    this.channelService.logEvent(
      'instagram',
      content,
      !result.success ? JSON.parse(JSON.stringify(result.error)) : undefined,
      result.success,
    );

    if (!result.success) {
      return null;
    }

    this.instagramService.handleMessage(result.data);

    res.sendStatus(200);
  }

  @UseGuards(JWTAccess)
  @Post('auth')
  async auth(@Agent() agentId: UUID, @Body() data: InstagramCodeDTO) {
    const { code, organization_id: orgId } = data;

    const hasAccess = await this.guard.hasAccessToOrganization(
      [CHANNEL_MANAGE],
      agentId,
      orgId,
    );

    if (!hasAccess) {
      throw new UnauthorizedException({
        message: 'Invalid Access',
        code: 'INVALID_ACCESS',
      });
    }

    await this.instagramService.authenticateChannel(code, orgId);

    return {
      code: 200,
      message: 'Successfully authenticated Instagram',
    };
  }
}
