import { UseGuards } from '@nestjs/common';
import { PermGuardConstructor, PermGuardOptions } from 'src/guard/perm-guard';

export const PermGuard = (permissions: bigint[], options?: PermGuardOptions) =>
  UseGuards(PermGuardConstructor(permissions, options));
