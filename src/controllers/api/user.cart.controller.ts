import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { Cart } from "src/entities/cart.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
import { CartService } from "src/services/cart/cart.service";
import { Request } from "express";
import { addArticleToCartDto } from "src/dtos/cart/add.article.to.cart.dto";
import { EditArticleInCartDto } from "src/dtos/cart/edit.article.in.cart.dto";
import { OrderService } from "src/services/order/order.service";
import { Order } from "src/entities/order.entity";
import { ApiResponse } from "src/misc/api.response.class";

@Controller('api/user/cart')
export class UserCartController {
    constructor(
        private cartService: CartService,
        private orderService: OrderService,

    ) { }

    private async getActiveCartForUserId(userId: number): Promise<Cart> {

        let cart = await this.cartService.getLastActiveCartByUserId(userId);

        if (!cart) {
            cart = await this.cartService.createNewCartForUser(userId)
        }

        return await this.cartService.getById(cart.cartId);
    }
    // GET http://localhost:3000/api/user/cart/
    @Get()
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('user')
    async getCurrentCart(@Req() req: Request): Promise<Cart> {
        return await this.getActiveCartForUserId(req.token.id);
    }
    // POST http://localhost:3000/api/user/cart/addToCart/
    @Post('addToCart')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('user')
    async addToCart(@Body() data: addArticleToCartDto, @Req() req: Request): Promise<Cart> {
        const cart = await this.getActiveCartForUserId(req.token.id);

        return await this.cartService.addArticleToCart(cart.cartId, data.articleId, data.quantity);
    }

    // PATCH http://localhost:3000/api/user/cart/
    @Patch()
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('user')
    async changeQuantity(@Body() data: EditArticleInCartDto, @Req() req: Request): Promise<Cart> {
        const cart = await this.getActiveCartForUserId(req.token.id);
        return await this.cartService.changeQuantity(cart.cartId, data.articleId, data.quantity)
    }
    // POST http://localhost:3000/api/user/cart/makeOrder/
    @Post('makeOrder')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('user')
    async makeOrder(@Req() req: Request):Promise<Order | ApiResponse>{
        const cart = await this.getActiveCartForUserId(req.token.id);
        return await this.orderService.add(cart.cartId)
    }

}