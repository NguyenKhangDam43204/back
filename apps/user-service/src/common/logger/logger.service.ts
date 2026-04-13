import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger();

  debug(context: string, message: string) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`[${context}] ${message}`);
    }
  }

  log(context: string, message: string) {
    this.logger.log(`[${context}] ${message}`);
  }

  error(context: string, message: string, trace?: string) {
    this.logger.error(`[${context}] ${message}`, trace);
  }

  warn(context: string, message: string) {
    this.logger.warn(`[${context}] ${message}`);
  }
}
