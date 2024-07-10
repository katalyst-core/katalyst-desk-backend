import { BadRequestException, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DrizzleService } from './database/drizzle.service';
import { User } from './database/database-schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly drizzle: DrizzleService,
  ) {}

  @Get()
  async getHello() {
    await this.drizzle.db.transaction(
      async (tx) => {
        await tx.insert(User).values({
          publicId: 'a',
          username: 'a',
          name: 'aa',
          email: 'test@test.com',
        });

        throw new BadRequestException('Testing');
      },
      {
        isolationLevel: 'read committed',
        accessMode: 'read write',
        deferrable: false,
      },
    );
    return this.appService.getHello();
  }
}
