import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // TODO : Delete this
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
