import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Controller, Get } from '@nestjs/common';
import { ArticleService } from "src/services/article/article.service";
import { Article } from "entities/article.entity";
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
}