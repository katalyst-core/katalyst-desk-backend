import { UUID } from 'crypto';
import { Generated } from 'kysely';

export interface Team {
  teamId: Generated<UUID>;
  organizationId: UUID;
  name: string;
}
