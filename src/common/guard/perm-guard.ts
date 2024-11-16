import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AgentAccess } from '@module/auth/auth.type';
import { GuardService } from '@util/guard.service';
import { GuardAccess } from '@util/guard.type';
import { UtilService } from '@util/util.service';

export type PermGuardOptions = {
  paramName?: {
    ticketId?: string;
    orgId?: string;
    channelId?: string;
    teamId?: string;
  };
};

export const PermGuardConstructor = (
  permission: string,
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

      let accessGuard: GuardAccess | null = null;
      if (ticketIdParam) {
        const _ticketId = UtilService.restoreUUID(ticketIdParam);
        accessGuard = await this.guard.hasAccessToTicket(
          permission,
          agentId,
          _ticketId,
        );
      }

      if (orgIdParam) {
        const _orgId = UtilService.restoreUUID(orgIdParam);
        accessGuard = await this.guard.hasAccessToOrganization(
          permission,
          agentId,
          _orgId,
        );
      }

      if (channelIdParam) {
        const _channelId = UtilService.restoreUUID(channelIdParam);
        accessGuard = await this.guard.hasAccessToChannel(
          permission,
          agentId,
          _channelId,
        );
      }

      if (teamIdParam) {
        const _teamId = UtilService.restoreUUID(teamIdParam);
        accessGuard = await this.guard.hasAccessToTeam(
          permission,
          agentId,
          _teamId,
        );
      }

      if (accessGuard) {
        req.accessLevel = accessGuard.accessLevel;
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
