import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CreateInteractionDto {
  @ApiProperty({ description: 'UUID del producto o pedido', example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID()
  targetId!: string;

  @ApiProperty({ enum: ['product', 'order'], description: 'Tipo de recurso asociado a la interacción' })
  @IsIn(['product', 'order'])
  targetType!: 'product' | 'order';

  @ApiProperty({ description: 'Contenido del mensaje o consulta', minLength: 2, maxLength: 1000 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 1000)
  message!: string;

  @ApiProperty({ description: 'UUID del destinatario participante' })
  @IsUUID()
  receiverId!: string;
}

export class ActivityLimitQuery {
  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
