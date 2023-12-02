import { Controller, Get } from '@nestjs/common';
import { AdministratorService } from '../services/administrator/administrator.service';

@Controller()
export class AppController {
  constructor(
    
  ) {}

  @Get()
  getHello(): string {
    return "Hello World!";
  }

}
