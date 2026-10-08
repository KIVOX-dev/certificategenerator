import 'dotenv/config';
import { join } from 'path';
import { setServers } from 'dns';

// Some networks/ISP resolvers refuse SRV lookups (mongodb+srv). DNS_SERVERS=8.8.8.8,1.1.1.1 overrides them.
if (process.env.DNS_SERVERS) setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));

/** All runtime configuration comes from environment variables (see .env.example). */
export function getConfig() {
  const env = process.env;
  const nodeEnv = env.NODE_ENV ?? 'development';
  const jwtSecret = env.JWT_SECRET ?? '';
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long (see .env.example).');
  }
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set (MongoDB connection string).');
  }
  const appUrl = (env.APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
  return {
    nodeEnv,
    isProd: nodeEnv === 'production',
    port: Number(env.PORT ?? 4000),
    databaseUrl: env.DATABASE_URL,
    apiUrl: (env.API_URL ?? 'http://localhost:4000').replace(/\/+$/, ''),
    appUrl,
    corsOrigins: (env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    trustProxy: env.TRUST_PROXY === 'true',
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '8h',
    cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : nodeEnv === 'production',
    storage: {
      driver: (env.STORAGE_DRIVER ?? 'local') as 'local' | 's3',
      localDir: env.STORAGE_LOCAL_DIR ?? join(process.cwd(), 'storage-data'),
      url: env.STORAGE_URL ?? '',
      bucket: env.STORAGE_BUCKET ?? '',
      region: env.STORAGE_REGION ?? 'auto',
      accessKey: env.STORAGE_ACCESS_KEY ?? '',
      secretKey: env.STORAGE_SECRET_KEY ?? '',
    },
    puppeteerExecutablePath: env.PUPPETEER_EXECUTABLE_PATH || undefined,
    adminEmail: env.ADMIN_EMAIL,
    adminPassword: env.ADMIN_PASSWORD,
  };
}
export type AppConfig = ReturnType<typeof getConfig>;
