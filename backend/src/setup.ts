import { INestApplication } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { getConfig } from './config/config';

/** Shared by main.ts and the e2e tests so tests exercise the real pipeline. Validation is per-route via Zod pipes. */
export function configureApp(app: INestApplication) {
  const cfg = getConfig();
  if (cfg.trustProxy) (app as any).set('trust proxy', cfg.trustProxy);
  app.setGlobalPrefix('api');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(cookieParser());
  if (cfg.corsOrigins.length) app.enableCors({ origin: cfg.corsOrigins, credentials: true });
  app.useGlobalFilters(new AllExceptionsFilter());
  return app;
}
