import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { ActivityLimitQuery, CreateInteractionDto } from './activity.dto';
import { ActivityService } from './activity.service';

@ApiTags('activity')
@Controller('activity')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Post('interactions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un mensaje o pregunta de interacción (MongoDB)' })
  createInteraction(
    @CurrentUser() userId: string,
    @Body() dto: CreateInteractionDto,
  ) {
    return this.activity.createInteraction(userId, dto);
  }

  @Get('interactions/target/:targetId')
  @ApiOperation({ summary: 'Consultar el historial de interacciones de un producto o pedido (MongoDB)' })
  getInteractionsByTarget(
    @CurrentUser() userId: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
    @Query() q: ActivityLimitQuery,
  ) {
    return this.activity.getInteractionsByTarget(targetId, userId, q.limit);
  }

  @Get('interactions/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar las interacciones enviadas o recibidas por el usuario actual (MongoDB)' })
  getMyInteractions(
    @CurrentUser() userId: string,
    @Query() q: ActivityLimitQuery,
  ) {
    return this.activity.getInteractionsByUser(userId, q.limit);
  }

  @Get('logs/resource/:resourceId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar eventos de auditoría y trazabilidad de un recurso (MongoDB)' })
  getResourceLogs(
    @CurrentUser() userId: string,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Query() q: ActivityLimitQuery,
  ) {
    return this.activity.getActivityLogs(resourceId, userId, q.limit);
  }

  @Get('logs/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar historial de acciones del usuario actual (MongoDB)' })
  getMyActivityLogs(
    @CurrentUser() userId: string,
    @Query() q: ActivityLimitQuery,
  ) {
    return this.activity.getUserActivityLogs(userId, q.limit);
  }
}
