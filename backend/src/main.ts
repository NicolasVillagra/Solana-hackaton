import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger Configuration for Interactive Testing
  const config = new DocumentBuilder()
    .setTitle('Gaia Ecotrack API')
    .setDescription('Production-grade API for Renewable Energy Tokenization on Solana')
    .setVersion('1.0')
    .addTag('energy')
    .addTag('devices')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`📝 Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();
