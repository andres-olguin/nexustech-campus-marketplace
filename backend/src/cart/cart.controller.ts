import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { CartDto, PageQuery } from '../common/dto';
import { CartService } from './cart.service';
@ApiTags('cart') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}
  @Get() get(@CurrentUser() u: string) { return this.cart.cart(u); }
  @Put() put(@CurrentUser() u: string, @Body() dto: CartDto) { return this.cart.put(u, dto); }
  @Delete(':productId') remove(@CurrentUser() u: string, @Param('productId', ParseUUIDPipe) id: string) { return this.cart.remove(u, id); }
}
@ApiTags('favorites') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller('favorites')
export class FavoritesController {
  constructor(private readonly cart: CartService) {}
  @Get() get(@CurrentUser() u: string, @Query() q: PageQuery) { return this.cart.favorites(u, q); }
  @Put(':productId') put(@CurrentUser() u: string, @Param('productId', ParseUUIDPipe) id: string) { return this.cart.favorite(u, id); }
  @Delete(':productId') remove(@CurrentUser() u: string, @Param('productId', ParseUUIDPipe) id: string) { return this.cart.favorite(u, id, true); }
}
