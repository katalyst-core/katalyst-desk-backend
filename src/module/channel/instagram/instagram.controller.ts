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

import { InstagramWebhookSchema } from './instagram.schema';
import { InstagramService } from './instagram.service';
import { InstagramCodeDTO } from './dto/instagram-code-dto';
import { ChannelService } from '../channel.service';
import { ApiConfigService } from 'src/config/api-config.service';
import { JWTAccess } from 'src/module/auth/strategy/jwt-access.strategy';
import { AgentAccess } from 'src/module/auth/auth.type';

@Controller('channel/instagram')
export class InstagramController {
  constructor(
    private readonly config: ApiConfigService,
    private readonly instagramService: InstagramService,
    private readonly channelService: ChannelService,
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
    if (!result.success) {
      return null;
    }

    this.instagramService.handleMessage(result.data);

    res.sendStatus(200);
  }

  @UseGuards(JWTAccess)
  @Post('auth')
  async auth(@Req() req: Request, @Body() data: InstagramCodeDTO) {
    const user = req.user as AgentAccess;
    const { agentId } = user;

    const { code, organization_id: organizationId } = data;

    await this.instagramService.authChannel(code, agentId, organizationId);

    return {
      code: 200,
      message: 'Successfully authenticated Instagram',
    };
  }
}
