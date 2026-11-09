import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { CheckoutDto, PageQuery, StatusDto } from '../common/dto';
import { OrdersService } from './orders.service';
@ApiTags('orders') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Post() checkout(@CurrentUser() u: string, @Body() dto: CheckoutDto) { return this.orders.checkout(u, dto); }
  @Get() list(@CurrentUser() u: string, @Query() q: PageQuery) { return this.orders.list(u, q); }
  @Get(':id') get(@CurrentUser() u: string, @Param('id', ParseUUIDPipe) id: string) { return this.orders.get(u, id); }
  @Patch(':id/status') cancel(@CurrentUser() u: string, @Param('id', ParseUUIDPipe) id: string, @Body() _dto: StatusDto) { return this.orders.cancel(u, id); }
}
