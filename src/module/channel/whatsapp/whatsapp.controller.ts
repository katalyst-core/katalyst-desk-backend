import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiConfigService } from 'src/config/api-config.service';
import { WhatsAppService } from './whatsapp.service';

@Controller('channel/whatsapp')
export class WhatsAppController {
  constructor(
    private readonly config: ApiConfigService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  @All('webhook')
  verifyWebhook(@Req() req: Request, @Res() res: Response) {
    console.log('whatsapp:', JSON.stringify(req.body));

    const webhookToken = this.config.getWhatsAppWebhookToken;

    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];

    if (mode === 'subscribe' && webhookToken === verifyToken) {
      return res.send(challenge);
    }

    // this.whatsAppService.handleMessage(req.body);

    res.sendStatus(200);
  }
}
