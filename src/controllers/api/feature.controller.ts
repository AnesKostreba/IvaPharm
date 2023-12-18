import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Feature } from "src/entities/feature.entity";
import { FeatureService } from "src/services/feature/feature.service";
import { Body, Controller, Get, Injectable, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";

@Crud({
    model: {
        type: Feature,
    },
    params: {
        featureId: {
            field: 'featureId',
            type: 'number',
            primary: true
        }
    },
    query: {
        alwaysPaginate: true,
        join: {
            category: {
                eager: true
            },
            articleFeatures: {
                eager: false
            },
            articles: {
                eager: false
            },
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
@ApiTags('api/feature')
@Controller('api/feature')
export class FeatureController implements CrudController<Feature> {
    constructor(public service: FeatureService) { }
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