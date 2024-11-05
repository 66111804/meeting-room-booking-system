import { Injectable } from '@nestjs/common';
import { LoggerService } from './core/logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly loggerService: LoggerService) {}
  getServer() {
    // this.loggerService.log('server is running');
    // this.loggerService.error('server is running');
    // this.loggerService.warn('server is running');
    // this.loggerService.debug('server is running');

    return { message: 'server is running' };
  }
}
