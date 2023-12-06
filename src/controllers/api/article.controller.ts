import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ArticleService } from "src/services/article/article.service";
import { Article } from "entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
@Controller('api/article')
@Crud({
  model: {
    type: Article,
  },
  params:{
    id:{
      field: 'articleId',
      type: 'number',
      primary: true
    }
  },
  query: {
    join:{
      category:{
        eager: true
      },
      photos:{
        eager: false
      },
      articlePrices: {
        eager: false
      },
      articleFeatures:{
        eager: false
      },
      features: {
        eager: false
      }
    }
  }
})
export class ArticleController {
  constructor(public service: ArticleService) {}
  @Get()
  @Override()
  async getMany(@ParsedRequest() req: CrudRequest) {
    return this.service.getMany(req);
  }

  @Post('createFull') // POST http://localhost:3000/api/article/createFull/
  createFullArticle(@Body() data: AddArticleDto){
    return this.service.createFullArticle(data);
  }
}