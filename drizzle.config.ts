import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/database/database-schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_STRING!,
  },
});
