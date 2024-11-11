import { Module } from '@nestjs/common';
import { FacebookAPI } from './facebook.api';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [FacebookAPI],
  exports: [FacebookAPI],
})
export class FacebookModule {}
