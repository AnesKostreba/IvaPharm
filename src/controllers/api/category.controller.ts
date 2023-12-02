import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Category } from "entities/category.entity";
import { CategoryService } from "src/services/category/category.service";
import { Controller, Get, Injectable, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Crud({
  model: {
    type: Category,
  },
  params: {
    categoryId: {
      field: 'categoryId',
      type: 'number',
      primary: true
    }
  },
  query: {
    join: {
      categories: {
        eager: true
      },
      features: {
        eager: true
      },
      parentCategory: {
        eager: false
      },
      articles: {
        eager: false
      }
    }
  }
})
@ApiTags('api/category')
@Controller('api/category')
export class CategoryController implements CrudController<Category> {
  constructor(public service: CategoryService) { }
  @Get()
  @Override()
  async getMany(@ParsedRequest() req: CrudRequest) {
    return this.service.getMany(req);
  }

  @Get(':id')
  @Override('getOneBase')
  async getOne(@ParsedRequest() req: CrudRequest, @Param('id') id: number) {
    req.parsed.paramsFilter = [{ field: 'id', operator: 'eq', value: id }];
    return this.service.getOne(req);
  }
}