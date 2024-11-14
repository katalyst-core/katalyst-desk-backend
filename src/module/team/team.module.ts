import { Module } from '@nestjs/common';
import { TeamService } from './team.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
