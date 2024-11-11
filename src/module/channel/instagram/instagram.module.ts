import { forwardRef, Module } from '@nestjs/common';

import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { ChannelModule } from '../channel.module';
import { HttpModule } from '@nestjs/axios';
import { InstagramAPI } from './instagram.api';

@Module({
  imports: [forwardRef(() => ChannelModule), HttpModule],
  controllers: [InstagramController],
  providers: [InstagramService, InstagramAPI],
  exports: [InstagramService],
})
export class InstagramModule {}
