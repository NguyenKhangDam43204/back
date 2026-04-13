import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class TokenUtil {
  static generateResetToken(): string {
    return uuidv4();
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static generateJti(): string {
    return uuidv4();
  }
}
