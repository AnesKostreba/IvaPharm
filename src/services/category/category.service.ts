import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Repository } from "typeorm";
import { Category } from "entities/category.entity";

@Injectable()
export class CategoryService extends TypeOrmCrudService<Category> {
    
    constructor(
        @InjectRepository(Category)
        private readonly category: Repository<Category>
    ){
        super(category)
    }

    // async getMany(): Promise<Category[] | null> {
    //     return this.category.find();
    // } //Bez ovoga ne radi baca gresku ERROR [ExceptionsHandler] Cannot destructure property 'parsed' of 'req' as it is null.
    // A SA OVIM NE RADE JOIN-ovi SAMO IZLISTA ALL CATEGORY
}
