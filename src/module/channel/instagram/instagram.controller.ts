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

import { ApiConfigService } from 'src/config/api-config.service';
import { InstagramService } from './instagram.service';
import { InstagramCodeDTO } from './dto/instagram-code-dto';
import { JWTAccess } from 'src/module/auth/strategy/jwt-access.strategy';
import { AgentAccess } from 'src/module/auth/auth.type';
import { InstagramWebhook } from './instagram.schema';

@Controller('channel/instagram')
export class InstagramController {
  constructor(
    private readonly config: ApiConfigService,
    private readonly instagramService: InstagramService,
  ) {}

  @All('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const rawBody = JSON.stringify(req.body);
    const signature = req.header('x-hub-signature-256');
    if (
      !rawBody ||
      !signature ||
      !this.instagramService.verifyRequestSHA256(rawBody, signature)
    ) {
      throw new UnauthorizedException();
    }

    console.log('instagram: ', rawBody);

    const webhookToken = this.config.getWhatsAppWebhookToken;

    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];

    if (mode === 'subscribe' && webhookToken === verifyToken) {
      return res.send(challenge);
    }

    const content = req.body;

    if (!content) {
      return null;
    }

    const result = InstagramWebhook.safeParse(content);
    if (!result.success) {
      return null;
    }

    await this.instagramService.handleMessage(result.data);

    res.sendStatus(200);
  }

  @UseGuards(JWTAccess)
  @Post('auth')
  async auth(@Req() req: Request, @Body() data: InstagramCodeDTO) {
    const user = req.user as AgentAccess;
    const { agentId } = user;

    const { code, organization_id: organizationId } = data;

    await this.instagramService.authUser(code, agentId, organizationId);

    return {
      code: 200,
      message: 'Successfully authenticated Instagram',
    };
  }
}
