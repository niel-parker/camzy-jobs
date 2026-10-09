import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js frontend (production domain https://jobs.camzytech.com + local + credentials support)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all origins dynamically while reflecting origin header (fixes browser wildcard credentials issue)
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With,Tenant-ID,X-Company-Slug,Access-Control-Allow-Origin',
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
