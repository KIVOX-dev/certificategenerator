import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getConfig } from '../config/config';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({ secret: getConfig().jwtSecret, signOptions: { expiresIn: getConfig().jwtExpiresIn as any } }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
