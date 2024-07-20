import { UUID } from 'crypto';
import { CreateTableBuilder, sql } from 'kysely';

import { UserModel } from './UserModel';
import { BasicUserAuthenticationModel } from './BasicUserAuthenticationModel';
import { UserSessionModel } from './UserSessionModel';
import { StoreModel } from './StoreModel';
import { MasterProductModel } from './MasterProductModel';

export interface AuditFields {
  created_at: Date;
  updated_at: Date;
  created_by: UUID;
  updated_by: UUID;
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

export {
  UserModel,
  BasicUserAuthenticationModel,
  UserSessionModel,
  StoreModel,
  MasterProductModel,
};
