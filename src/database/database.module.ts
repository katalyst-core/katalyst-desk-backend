import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { CamelCasePlugin, PostgresDialect } from 'kysely';

import {
  ConfigurableDatabaseModule,
  DATABASE_OPTIONS,
} from './database.module-definition';
import { DatabaseOptions } from './database-options';
import { Database } from './database';

@Global()
@Module({
  exports: [Database],
  providers: [
    {
      provide: Database,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        const dialect = new PostgresDialect({
          pool: new Pool({
            connectionString: databaseOptions.connectionString,
          }),
        });

        return new Database({
          dialect,
          plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
        });
      },
    },
  ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
