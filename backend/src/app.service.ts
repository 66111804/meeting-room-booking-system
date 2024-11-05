import { Injectable } from '@nestjs/common';
import { LoggerService } from './core/logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly loggerService: LoggerService) {}
  getServer() {
    return { message: 'server is running' };
  }
}
