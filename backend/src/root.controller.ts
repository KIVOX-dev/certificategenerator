import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

/** Friendly answer for anyone who opens the API address in a browser. */
@Controller()
@SkipThrottle()
export class RootController {
  @Get()
  root() {
    return {
      service: 'Certificate Platform API',
      status: 'running',
      health: '/api/health',
      note: 'This address is the API only. Participants use the website, not this address.',
    };
  }
}
