import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { FileMigrationProvider, Kysely, Migrator } from 'kysely';
import * as path from 'path';
import { promises as fs } from 'fs';
import { NeonDialect } from 'kysely-neon';
import { WebSocket } from 'undici';

config();

const configService = new ConfigService();

async function migrateToLatest() {
  const db = new Kysely({
    dialect: new NeonDialect({
      connectionString: configService.get('DB_STRING'),
      webSocketConstructor: WebSocket,
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migration'),
    }),
  });

  const command = process.argv[3];
  console.log(`Migration action: ${command || 'latest'}`);
  let result = null;

  switch (command) {
    case 'up':
      result = await migrator.migrateUp();
      break;

    case 'down':
      result = await migrator.migrateDown();
      break;

    default:
    case 'latest':
      result = await migrator.migrateToLatest();
      break;
  }

  const { error, results } = result;

  results?.forEach((result) => {
    const status = result.status;

    if (status === 'Success') {
      console.log(`Successfully migrated "${result.migrationName}"`);
    }

    if (status === 'Error') {
      console.error(`Failed to migrate "${result.migrationName}"`);
    }
  });

  if (error) {
    console.error('Failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
