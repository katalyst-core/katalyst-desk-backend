import { forwardRef, Module } from '@nestjs/common';

import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { ChannelModule } from '../channel.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => ChannelModule), HttpModule],
  controllers: [InstagramController],
  providers: [InstagramService],
})
export class InstagramModule {}
