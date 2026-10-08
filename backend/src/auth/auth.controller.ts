import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { zodBody } from '../common/zod.pipe';
import { getConfig } from '../config/config';
import { ADMIN_COOKIE, AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';

const loginSchema = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) }).strict();

@Controller('admin/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: () => getConfig().rateLimit.login, ttl: 60_000 } })
  async login(@Body(zodBody(loginSchema)) dto: z.infer<typeof loginSchema>, @Res({ passthrough: true }) res: any) {
    const { token, user } = await this.auth.login(dto.email, dto.password);
    res.cookie(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'strict', // also our CSRF defence: the cookie is never sent on cross-site requests
      secure: getConfig().cookieSecure,
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    });
    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie(ADMIN_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@Req() req: any) {
    return { user: this.auth.publicUser(req.user) };
  }
}
