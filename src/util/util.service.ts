import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class UtilService {
  private readonly defaultString = '0123456789abcdefghijklmnopqrstuvwxyz';

  generateToken(length = 16): string {
    return customAlphabet(this.defaultString, length)();
  }
}
