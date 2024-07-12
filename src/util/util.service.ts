import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class UtilService {
  private readonly defaultString = '0123456789abcdefghijklmnopqrstuvwxyz';

  generateToken(length): string {
    return customAlphabet(this.defaultString, length)();
  }

  generatePublicId(): string {
    return this.generateToken(16);
  }
}
