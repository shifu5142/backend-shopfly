import { setDefaultResultOrder } from 'node:dns';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const port = process.env.PORT ?? 8080;
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix('api/v1'); //prefix for all routes
  await app.listen(port);
  console.log(`Server is running on port ${port} 🚀`);
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
