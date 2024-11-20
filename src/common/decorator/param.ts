import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { restoreUUID } from '@util/index';
import { AgentAccess } from '@module/auth/auth.type';
import type { AccessLevel } from '@guard/guard.type';

export const Agent = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user as AgentAccess;
  const { agentId } = user;
  return agentId;
});

export const ParamUUID = (param: string) =>
  createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const shortUUID = req.params[param];
    return restoreUUID(shortUUID);
  })();

export const PermLevel = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.accessLevel as AccessLevel;
});
