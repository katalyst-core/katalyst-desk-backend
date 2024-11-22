import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { restoreUUID } from '@util/index';
import { AgentAccess } from '@module/auth/auth.type';
import { GuardAccess } from '@guard/guard.type';
import { GuardService } from '@guard/guard.service';

export type PermGuardOptions = {
  paramName?: {
    ticketId?: string;
    orgId?: string;
    channelId?: string;
    teamId?: string;
  };
};

export const PermGuardConstructor = (
  permissions: bigint[],
  options?: PermGuardOptions,
) => {
  @Injectable()
  class PermGuardStrategy implements CanActivate {
    constructor(readonly guard: GuardService) {}

    async canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      const user = req.user as AgentAccess;
      const { agentId } = user;

      const params = req.params;
      const paramNames = options?.paramName;

      const ticketIdParam = params[paramNames?.ticketId || 'ticketId'];
      const orgIdParam = params[paramNames?.orgId || 'orgId'];
      const channelIdParam = params[paramNames?.channelId || 'channelId'];
      const teamIdParam = params[paramNames?.teamId || 'teamId'];

      let guardAccess: GuardAccess | null = null;
      if (ticketIdParam) {
        const _ticketId = restoreUUID(ticketIdParam);
        guardAccess = await this.guard.hasAccessToTicket(
          permissions,
          agentId,
          _ticketId,
        );
      }

      if (orgIdParam) {
        const _orgId = restoreUUID(orgIdParam);
        guardAccess = await this.guard.hasAccessToOrganization(
          permissions,
          agentId,
          _orgId,
        );
      }

      if (channelIdParam) {
        const _channelId = restoreUUID(channelIdParam);
        guardAccess = await this.guard.hasAccessToChannel(
          permissions,
          agentId,
          _channelId,
        );
      }

      if (teamIdParam) {
        const _teamId = restoreUUID(teamIdParam);
        guardAccess = await this.guard.hasAccessToTeam(
          permissions,
          agentId,
          _teamId,
        );
      }

      if (guardAccess) {
        req.guardAccess = guardAccess;
        return true;
      }

      throw new UnauthorizedException({
        message: 'Invalid Access',
        code: 'INVALID_ACCESS',
      });
    }
  }

  return PermGuardStrategy;
};
