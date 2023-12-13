import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Repository } from "typeorm";
import { Category } from "src/entities/category.entity";

@Injectable()
export class CategoryService extends TypeOrmCrudService<Category> {
  constructor(
    @InjectRepository(Category) repo: Repository<Category>,
  ) {
    super(repo);
  }
}