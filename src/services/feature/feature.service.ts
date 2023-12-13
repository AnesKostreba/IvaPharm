import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Repository } from "typeorm";
import { Feature } from "src/entities/Feature.entity";
import { CrudRequest } from "@nestjsx/crud";

@Injectable()
export class FeatureService extends TypeOrmCrudService<Feature> {
  constructor(
    @InjectRepository(Feature) private readonly feature: Repository<Feature>,
  ) {
    super(feature);
  }
}