"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, callback) => {
            callback(null, true);
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With,Tenant-ID,X-Company-Slug,Access-Control-Allow-Origin',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Camzy Jobs Enterprise Platform API')
        .setDescription('NestJS REST API documentation for Camzy Jobs multi-tenant job portal with dynamic theme configuration and company plan subscriptions.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`🚀 NestJS Backend Server running on http://localhost:${port}`);
    console.log(`📚 Swagger API Specs available on http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map