import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Setup Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Camzy Jobs Enterprise Platform API')
    .setDescription('NestJS REST API documentation for Camzy Jobs multi-tenant job portal with dynamic theme configuration and company plan subscriptions.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 NestJS Backend Server running on http://localhost:${port}`);
  console.log(`📚 Swagger API Specs available on http://localhost:${port}/api/docs`);
}

bootstrap();
