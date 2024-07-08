import { NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { Inject, Injectable } from '@nestjs/common';

import { NEON } from './database.module-definition';
import { schema } from './database-schema';

@Injectable()
export class DrizzleService {
  public db: NeonHttpDatabase<typeof schema>;
  constructor(
    @Inject(NEON) private readonly neon: NeonQueryFunction<any, any>,
  ) {
    this.db = drizzle(this.neon);
  }
}
