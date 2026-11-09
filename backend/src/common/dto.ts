import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min, IsUrl, IsIn, Matches, ValidateIf } from 'class-validator';

export class PageQuery {
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @Max(100000) page = 1;
  @ApiPropertyOptional({ default: 20, maximum: 100 }) @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
export class CatalogQuery extends PageQuery {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 160) search?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(2500000) minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(2500000) maxPrice?: number;
}
export class RegisterDto {
  @ApiProperty({ example: 'demo@example.test' }) @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value) @IsEmail() @Length(3, 254) email!: string;
  @ApiProperty({ minLength: 12 }) @IsString() @Length(12, 128) password!: string;
  @ApiProperty() @IsString() @Matches(/\S/) @Length(3, 80) name!: string;
}
export class LoginDto {
  @ApiProperty() @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value) @IsEmail() @Length(3, 254) email!: string;
  @ApiProperty() @IsString() @Length(1, 128) password!: string;
}
export class ProfileDto {
  @ApiPropertyOptional() @ValidateIf((_o, v) => v !== undefined) @IsString() @Matches(/\S/) @Length(3, 80) name?: string;
  @ApiPropertyOptional() @ValidateIf((_o, v) => v !== undefined) @IsString() @Matches(/\S/) @Length(3, 80) sellerName?: string;
}
export class CategoryDto {
  @ApiProperty() @IsString() @Matches(/\S/) @Length(3, 80) name!: string;
}
export class ProductDto {
  @ApiProperty() @IsString() @Matches(/\S/) @Length(3, 160) name!: string;
  @ApiProperty() @IsString() @Matches(/\S/) @Length(10, 2000) description!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() categoryId!: string;
  @ApiProperty({ minimum: 1000, maximum: 2500000 }) @IsInt() @Min(1000) @Max(2500000) price!: number;
  @ApiProperty({ minimum: 0, maximum: 100000 }) @IsInt() @Min(0) @Max(100000) stock!: number;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @Length(1, 1000) imageUrl?: string;
}
export class UpdateProductDto extends PartialType(ProductDto, { skipNullProperties: false }) {}
export class CartDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productId!: string;
  @ApiProperty({ minimum: 1, maximum: 100 }) @IsInt() @Min(1) @Max(100) quantity!: number;
}
export class CheckoutDto {
  @ApiProperty() @IsString() @Matches(/\S/) @Length(10, 500) shippingAddress!: string;
  @ApiProperty({ description: 'Clave única del intento; reutilizar para reintentos' }) @IsString() @Matches(/^[a-zA-Z0-9_-]+$/) @Length(8, 100) idempotencyKey!: string;
}
export class StatusDto {
  @ApiProperty({ enum: ['cancelled'] }) @IsIn(['cancelled']) status!: 'cancelled';
}
export class FulfillmentStatusDto {
  @ApiProperty({ enum: ['preparing', 'shipped', 'delivered'], description: 'Solo la transición siguiente, declarada por el vendedor de esos productos' })
  @IsIn(['preparing', 'shipped', 'delivered']) status!: 'preparing' | 'shipped' | 'delivered';
}
