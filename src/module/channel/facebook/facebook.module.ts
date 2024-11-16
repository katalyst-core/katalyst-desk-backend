import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { FacebookAPI } from './facebook.api';

@Module({
  imports: [HttpModule],
  providers: [FacebookAPI],
  exports: [FacebookAPI],
})
export class FacebookModule {}
