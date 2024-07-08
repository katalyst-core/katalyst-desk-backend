import { defineConfig } from 'drizzle-kit';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';

const configService = new ConfigService();

export default defineConfig({
  schema: './src/database/database-schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: configService.get('PG_HOST'),
    database: configService.get('PG_DATABASE'),
    user: configService.get('PG_USER'),
    password: configService.get('PG_PASSWORD'),
  },
});
