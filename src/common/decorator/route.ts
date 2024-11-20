import { UseGuards } from '@nestjs/common';
import { PermGuardConstructor, PermGuardOptions } from 'src/guard/perm-guard';

export const PermGuard = (permission: string, options?: PermGuardOptions) =>
  UseGuards(PermGuardConstructor(permission, options));
