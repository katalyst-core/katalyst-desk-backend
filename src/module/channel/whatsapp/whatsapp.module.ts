import { forwardRef, Module } from '@nestjs/common';

import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { ChannelModule } from '../channel.module';

@Module({
  imports: [forwardRef(() => ChannelModule)],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
})
export class WhatsAppModule {}
