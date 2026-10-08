import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from './config/config';
import { configureApp } from './setup';

async function bootstrap() {
  const cfg = getConfig();
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();
  await app.listen(cfg.port);
  console.log(`API listening on :${cfg.port}`);
}
bootstrap();
