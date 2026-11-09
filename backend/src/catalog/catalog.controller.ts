import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { CatalogQuery, CategoryDto, ProductDto, UpdateProductDto } from '../common/dto';
import { CatalogService } from './catalog.service';
@ApiTags('categories') @Controller('categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogService) {}
  @Get() list() { return this.catalog.categories(); }
  @Post() @UseGuards(AuthGuard) @ApiBearerAuth() create(@CurrentUser() u: string, @Body() dto: CategoryDto) { return this.catalog.createCategory(u, dto); }
  @Patch(':id') @UseGuards(AuthGuard) @ApiBearerAuth() update(@CurrentUser() u: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CategoryDto) { return this.catalog.updateCategory(u, id, dto); }
  @Delete(':id') @UseGuards(AuthGuard) @ApiBearerAuth() remove(@CurrentUser() u: string, @Param('id', ParseUUIDPipe) id: string) { return this.catalog.updateCategory(u, id); }
}
@ApiTags('products') @Controller('products')
export class ProductsController {
  constructor(private readonly catalog: CatalogService) {}
  @Get() list(@Query() q: CatalogQuery) { return this.catalog.list(q); }
  @Get(':id') get(@Param('id', ParseUUIDPipe) id: string) { return this.catalog.get(id); }
  @Post() @UseGuards(AuthGuard) @ApiBearerAuth() create(@CurrentUser() u: string, @Body() dto: ProductDto) { return this.catalog.create(u, dto); }
  @Patch(':id') @UseGuards(AuthGuard) @ApiBearerAuth() update(@CurrentUser() u: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) { return this.catalog.update(u, id, dto); }
  @Delete(':id') @UseGuards(AuthGuard) @ApiBearerAuth() remove(@CurrentUser() u: string, @Param('id', ParseUUIDPipe) id: string) { return this.catalog.update(u, id); }
}
@ApiTags('publications') @Controller('publications')
export class PublicationsController {
  constructor(private readonly catalog: CatalogService) {}
  @Get() list(@Query() q: CatalogQuery) { return this.catalog.list(q); }
}
