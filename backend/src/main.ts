import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable restricted CORS for production hardening
  app.enableCors({
    origin: ['https://gaia.energy', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });
  
  // Enable global validation pipes for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
