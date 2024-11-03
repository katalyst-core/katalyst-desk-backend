import { Global, Module } from '@nestjs/common';
import { WebSocket } from 'undici';

import {
  ConfigurableDatabaseModule,
  DATABASE_OPTIONS,
} from './database.module-definition';
import { DatabaseOptions } from './database-options';
import { Database } from './database';
import { NeonDialect } from 'kysely-neon';
import { CamelCasePlugin } from 'kysely';

@Global()
@Module({
  exports: [Database],
  providers: [
    {
      provide: Database,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        const dialect = new NeonDialect({
          connectionString: databaseOptions.connectionString,
          webSocketConstructor: WebSocket,
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
