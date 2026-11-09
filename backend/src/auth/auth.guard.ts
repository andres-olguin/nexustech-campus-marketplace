import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { User } from '../database/entities';
export type AuthRequest = Request & { userId: string };
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly db: DataSource) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const match = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
    if (!match) throw new UnauthorizedException('Se requiere Bearer token');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(match[1], { algorithms: ['HS256'], issuer: 'nexustech', audience: 'nexustech-api' });
      if (typeof payload.sub !== 'string' || !await this.db.getRepository(User).existsBy({ id: payload.sub })) throw new Error();
      req.userId = payload.sub;
      return true;
    } catch { throw new UnauthorizedException('Token inválido o expirado'); }
  }
}
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => ctx.switchToHttp().getRequest<AuthRequest>().userId);
