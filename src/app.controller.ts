import { Controller, Get } from '@nestjs/common';
import { AdministratorService } from './services/administrator/administrator.service';
import { Administrator } from 'entities/administrator.entity';

@Controller()
export class AppController {
  constructor(
    private administrator: AdministratorService
  ) {}

  @Get()
  getHello(): string {
    return "Hello World!";
  }

  @Get('api/administrator')
  getAllAdmin():Promise<Administrator[]>{
    return this.administrator.getAll();
  }
}
