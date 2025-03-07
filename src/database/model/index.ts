import { UUID } from 'crypto';
import { CreateTableBuilder, sql } from 'kysely';

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
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('created_by', 'uuid')
    .addColumn('updated_by', 'uuid');
}
