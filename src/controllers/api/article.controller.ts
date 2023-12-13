import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { ArticleService } from "src/services/article/article.service";
import { Article } from "src/entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { StorageConfig } from "config/storage.config";
import { Photo } from "src/entities/photo.entity";
import { PhotoService } from "src/services/photo/photo.service";
import { ApiResponse } from "src/misc/api.response.class";
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as sharp from "sharp";

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
  constructor(
    public service: ArticleService,

    public photoService: PhotoService,
    ) {}
  @Get()
  @Override()
  async getMany(@ParsedRequest() req: CrudRequest) {
    return this.service.getMany(req);
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<Article> {
    const article = await this.service.findOne({
      where: { articleId: id },
      relations: ['category', 'articleFeatures', 'features', 'articlePrices', 'photos'],
    });

    return article;
  }

  @Post('createFull') // POST http://localhost:3000/api/article/createFull/
  createFullArticle(@Body() data: AddArticleDto){
    return this.service.createFullArticle(data);
  }

  @Post(':id/uploadPhoto') //POST http://localhost:3000/api/article/:id/uploadPhoto
    @UseInterceptors(
      FileInterceptor('photo',{
        storage: diskStorage({
          destination: StorageConfig.photo.destination,
          filename: (req, file, callback) =>{
            // 'Neka slika.jpg' ->
            // '20230420-589327432-Neka-slika.jpg'

            let original:string = file.originalname;
            
            let normalized = original.replace(/\s+/g, '-');
             normalized = normalized.replace(/[^A-z0-9\.\-]/g, ''); //obrisi sve suvisne karaktere osim alfa numerickih karaktera, obrisi, potpuno eliminisi sve karaktere koji nisu slova a-z cifre od 0-9, simbol . i simbol -
            let sada = new Date();
            let datePart = '';
            datePart += sada.getFullYear().toString();
            datePart += (sada.getMonth() +1).toString();
            datePart += sada.getDate().toString();

            
            let randomPart: string = 
                         new Array(10)
                         .fill(0)
                         .map(e => (Math.random() * 9).toFixed(0).toString())
                         .join('');
            let fileName = datePart + '-' + randomPart + '-' + normalized;

            fileName = fileName.toLocaleLowerCase();

            callback(null,fileName);
          }
        }),
        fileFilter: (req, file, callback) =>{
          // 1. provera ekstenzija : JPG, PNG
          if(!file.originalname.toLowerCase().match(/\.(jpg|png)$/)){
            req.fileFilterError = "Bad file extension!";
            callback(null, false);
            return;
          }

          // 2. provera tipa sadrzaja: image/jpeg, image/png (mimetype)
          if(!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))){
            req.fileFilterError = "Bad file content type!";
            callback(null, false);
            return;
          }

          callback(null,true);
        },
        limits:{
          files: 1,
          fileSize:  StorageConfig.photo.maxSize,
        }

      })
    )
    async uploadPhoto(
      @Param('id') articleId: number,
      @UploadedFile() photo,
      @Req() req
      ): Promise<ApiResponse | Photo>{
        if(req.fileFilterError){
          return new ApiResponse('error', -4002, req.fileFilterError) // -4002 greske iz fileFilterError-a
        }
        if(!photo){
          return new ApiResponse('error', -4002, 'File not uploaded!');
        }

        
        
        // TODO: Real Mime Type check

        const fileTypeResult = await fileType.fromFile(photo.path);
        if(!fileTypeResult){
          // TODO: Obrisati taj fajl
          fs.unlinkSync(photo.path);
          return new ApiResponse('error', -4002, 'Cannot detect file type!!');
        }

        const realMimeType = fileTypeResult.mime;
        if(!(realMimeType.includes('jpeg') || realMimeType.includes('png'))){
          // TODO: Obrisati taj fajl
          fs.unlinkSync(photo.path);
          return new ApiResponse('error', -4002, "Bad file content type!");
        }
           

        // TODO: Save a resize file

        await this.createResizedImage(photo, StorageConfig.photo.resize.thumb)
        await this.createResizedImage(photo, StorageConfig.photo.resize.small)


      const newPhoto: Photo = new Photo();
      newPhoto.articleId = articleId;
      newPhoto.imagePath = photo.filename;

      const savedPhoto = await this.photoService.add(newPhoto);
      if(!savedPhoto){
        return new ApiResponse('error', -4001); // file not uploaded -4001
      }

      return savedPhoto;
    }


    async createResizedImage(photo, resizeSettings){
      const originalFilePath = photo.path;
      const fileName = photo.filename;

      const destinationFilePath = 
      StorageConfig.photo.destination + 
      resizeSettings.directory + 
      fileName;

      await sharp(originalFilePath)
            .resize({
              fit: "cover",
              width: resizeSettings.width,
              height: resizeSettings.height,
            })
            .toFile(destinationFilePath);
    }
}