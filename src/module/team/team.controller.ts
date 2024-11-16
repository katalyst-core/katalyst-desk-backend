import { Controller, Delete, UseGuards } from '@nestjs/common';
import { UUID } from 'crypto';

import { ParamUUID } from '@decorator/param';
import { PermGuard } from '@decorator/route';
import { JWTAccess } from '@module/auth/strategy/jwt-access.strategy';

import { TeamService } from './team.service';

@UseGuards(JWTAccess)
@Controller('/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @PermGuard('ticket.delete')
  @Delete('/:teamId')
  async deleteTeam(@ParamUUID('teamId') teamId: UUID) {
    await this.teamService.deleteTeam(teamId);

    return {
      code: 200,
      message: 'Successfully deleted team',
    };
  }
}
