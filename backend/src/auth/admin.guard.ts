import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppException } from '../common/app.exception';
import { AuthService } from './auth.service';

export const ADMIN_COOKIE = 'admin_token';

/** Accepts the httpOnly session cookie (admin panel) or a Bearer token (API clients). */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const header: string | undefined = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.[ADMIN_COOKIE];
    const user = token ? await this.auth.verify(token) : null;
    if (!user) throw new AppException('UNAUTHORIZED', 'Please log in.', 401);
    req.user = user;
    return true;
  }
}
