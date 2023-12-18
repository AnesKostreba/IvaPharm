import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Category } from "src/entities/category.entity";
import { CategoryService } from "src/services/category/category.service";
import { Controller, Get, Injectable, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";

@Crud({
  model: {
    type: Category,
  },
  params: {
    categoryId: {
      field: 'category_id',
      type: 'number',
      primary: true
    }
  },
  query: {
    alwaysPaginate: true,
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
  },
  routes: {
    only: [
        'createOneBase',
        'createManyBase',
        'updateOneBase',
        'getManyBase',
        'getOneBase',
    ],
    createOneBase: {
        decorators: [
            UseGuards(RoleCheckedGuard),
            AllowToRoles('administrator'),
        ],
    },
    createManyBase: {
        decorators: [
            UseGuards(RoleCheckedGuard),
            AllowToRoles('administrator'),
        ],
    },
    updateOneBase: {
        decorators: [
            UseGuards(RoleCheckedGuard),
            AllowToRoles('administrator'),
        ],
    },
    getManyBase: {
        decorators: [
            UseGuards(RoleCheckedGuard),
            AllowToRoles('administrator', 'user'),
        ],
    },
    getOneBase: {
        decorators: [
            UseGuards(RoleCheckedGuard),
            AllowToRoles('administrator', 'user'),
        ],
    },
},
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