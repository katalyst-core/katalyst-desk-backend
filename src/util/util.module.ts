import { Global, Module } from '@nestjs/common';
import { UtilService } from './util.service';
import { GuardService } from './guard.service';

@Global()
@Module({
  providers: [UtilService, GuardService],
  exports: [UtilService, GuardService],
})
export class UtilModule {}
