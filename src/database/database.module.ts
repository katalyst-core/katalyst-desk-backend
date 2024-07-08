import { Global, Module } from '@nestjs/common';
import {
  ConfigurableDatabaseModule,
  DATABASE_OPTIONS,
  NEON,
} from './database.module-definition';
import { DrizzleService } from './drizzle.service';
import { DatabaseOptions } from './database-options';
import { neon } from '@neondatabase/serverless';

@Global()
@Module({
  exports: [DrizzleService],
  providers: [
    DrizzleService,
    {
      provide: NEON,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        return neon(databaseOptions.connectionString);
      },
    },
  ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
