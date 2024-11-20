import { Global, Module } from '@nestjs/common';
import { GuardService } from './guard.service';

@Global()
@Module({
  providers: [GuardService],
  exports: [GuardService],
})
export class GuardModule {}
