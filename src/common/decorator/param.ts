import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AgentAccess } from 'src/module/auth/auth.type';
import { UtilService } from 'src/util/util.service';

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
    return UtilService.restoreUUID(shortUUID);
  })();
