import { Global, Module } from '@nestjs/common';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { WebSocket } from 'undici';

import {
  ConfigurableDatabaseModule,
  DATABASE_OPTIONS,
  NEON,
} from './database.module-definition';
import { DrizzleService } from './drizzle.service';
import { DatabaseOptions } from './database-options';

@Global()
@Module({
  exports: [DrizzleService],
  providers: [
    DrizzleService,
    {
      provide: NEON,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        neonConfig.webSocketConstructor = WebSocket;
        return new Pool({ connectionString: databaseOptions.connectionString });
      },
    },
  ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
