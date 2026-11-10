import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET || 'insecure-dev-fallback-key-for-test-purposes-32-bytes';
        return {
          secret,
          signOptions: {
            algorithm: 'HS256' as const,
            expiresIn: '1h' as const,
            issuer: 'nexustech',
            audience: 'nexustech-api',
          },
        };
      },
    }),
  ],
  controllers: [ActivityController],
  providers: [ActivityService, AuthGuard],
  exports: [ActivityService],
})
export class ActivityModule {}
