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
  // Printed QR codes must never point at localhost. The public site URL can be corrected without redeploying:
  // admin panel -> Settings -> Public site URL (stored in the database, overrides APP_URL).
  if (nodeEnv === 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(appUrl)) {
    console.warn('WARNING: APP_URL is localhost in production. Set it to your public site URL (env var or admin Settings).');
  }
  return {
    nodeEnv,
    isProd: nodeEnv === 'production',
    port: Number(env.PORT ?? 4000),
    databaseUrl: env.DATABASE_URL,
    apiUrl: (env.API_URL ?? 'http://localhost:4000').replace(/\/+$/, ''),
    appUrl,
    corsOrigins: (env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    // Number of reverse proxies in front of the API (Vercel + Render = 2). 'true' = 1, unset/false = 0.
    trustProxy: env.TRUST_PROXY === 'true' ? 1 : Number(env.TRUST_PROXY) > 0 ? Math.floor(Number(env.TRUST_PROXY)) : 0,
    // Per-IP limits per minute. Events share one Wi-Fi/mobile IP, so the registration limit is generous.
    rateLimit: {
      global: Number(env.RATE_LIMIT_GLOBAL ?? 300),
      register: Number(env.RATE_LIMIT_REGISTER ?? 60),
      lookup: Number(env.RATE_LIMIT_LOOKUP ?? 120),
      login: Number(env.RATE_LIMIT_LOGIN ?? 8),
    },
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
