import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppAPI } from './whatsapp.api';
import { ChannelModule } from '../channel.module';
import { FacebookModule } from '../facebook/facebook.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => ChannelModule),
    forwardRef(() => FacebookModule),
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, WhatsAppAPI],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
