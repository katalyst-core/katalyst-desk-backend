import { UUID } from 'crypto';
import { CreateTableBuilder, sql } from 'kysely';

import { Agent } from './Agent';
import { AgentAuth } from './AgentAuth';
import { AgentSession } from './AgentSession';
import { AuthType } from './AuthType';

export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;
  updatedBy: UUID;
}

export function withAudit(
  builder: CreateTableBuilder<any>,
): CreateTableBuilder<any> {
  return builder
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('created_by', 'uuid')
    .addColumn('updated_by', 'uuid');
}

export { Agent, AgentAuth, AgentSession, AuthType };
