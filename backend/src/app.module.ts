import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import database from './database/data-source';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { CatalogService } from './catalog/catalog.service';
import { CategoriesController, ProductsController, PublicationsController } from './catalog/catalog.controller';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { CartService } from './cart/cart.service';
import { CartController, FavoritesController } from './cart/cart.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersController, SellerOrdersController } from './orders/orders.controller';
import { HealthController } from './health.controller';
import { ActivityEvents } from './common/activity-events';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...database.options, retryAttempts: 1 }),
    JwtModule.registerAsync({ useFactory: () => {
      const secret = process.env.JWT_SECRET;
      if (!secret || Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET debe tener al menos 32 bytes');
      return { secret, signOptions: { algorithm: 'HS256' as const, expiresIn: '1h' as const, issuer: 'nexustech', audience: 'nexustech-api' } };
    } }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    EventEmitterModule.forRoot(),
    // Integration point: import ActivityModule here when the MongoDB agent delivers it.
  ],
  controllers: [AuthController, CategoriesController, ProductsController, PublicationsController, UsersController, CartController, FavoritesController, OrdersController, SellerOrdersController, HealthController],
  providers: [ActivityEvents, AuthGuard, AuthService, CatalogService, UsersService, CartService, OrdersService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
