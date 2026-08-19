import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  ParseArrayPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartDto } from './dto/cart.dto';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../auth/auth.guard';
import { CheckoutDto } from './dto/checkout.dto';
@Controller('orders')
@UseGuards(AuthGuard) //protect all routes
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('cart')
  async addToCart(
    @Req() req: any,
    @Body(new ParseArrayPipe({ items: CartDto }))
    cartDto: CartDto[],
  ): Promise<CartDto[]> {
    return this.ordersService.addToCart(req.user.sub, cartDto);
  }
  @Get('cart')
  async getCart(): Promise<CartDto[] | BadRequestException> {
    try {
      return await this.ordersService.getCart();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
  @Post('checkout')
  async checkout(@Body() checkoutDto: CheckoutDto) {
    return this.ordersService.checkout(checkoutDto);
  }

  @Get('dashboard')
  async getDashboard() {
    try {
      return await this.ordersService.getDashboard();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
