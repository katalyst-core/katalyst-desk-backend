import { Pool } from '@neondatabase/serverless';
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { Inject, Injectable } from '@nestjs/common';

import { NEON } from './database.module-definition';

export type Drizzle = NeonDatabase;

@Injectable()
export class DrizzleService {
  public db: Drizzle;
  constructor(@Inject(NEON) private readonly pool: Pool) {
    this.db = drizzle(this.pool);
  }
}
