import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { ChannelModule } from '../channel.module';
import { InstagramAPI } from './instagram.api';

@Module({
  imports: [forwardRef(() => ChannelModule), HttpModule],
  controllers: [InstagramController],
  providers: [InstagramService, InstagramAPI],
  exports: [InstagramService],
})
export class InstagramModule {}
