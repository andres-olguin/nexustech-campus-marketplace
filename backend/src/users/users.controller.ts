import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { ProfileDto } from '../common/dto';
import { UsersService } from './users.service';
@ApiTags('users') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me') me(@CurrentUser() u: string) { return this.users.me(u); }
  @Patch('me') update(@CurrentUser() u: string, @Body() dto: ProfileDto) { return this.users.update(u, dto); }
}
