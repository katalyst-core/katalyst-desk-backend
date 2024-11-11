import { forwardRef, Module } from '@nestjs/common';

import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { ChannelModule } from '../channel.module';
import { FacebookModule } from '../facebook/facebook.module';
import { WhatsAppAPI } from './whatsapp.api';
import { HttpModule } from '@nestjs/axios';

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
