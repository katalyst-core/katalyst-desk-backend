import { forwardRef, Module } from '@nestjs/common';

import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { ChannelModule } from '../channel.module';

@Module({
  imports: [forwardRef(() => ChannelModule)],
  controllers: [InstagramController],
  providers: [InstagramService],
})
export class InstagramModule {}
