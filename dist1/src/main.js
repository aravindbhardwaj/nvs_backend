"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const prisma_service_1 = require("./prisma/prisma.service");
const common_2 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const corsOrigins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: corsOrigins,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.use((0, helmet_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    const prismaService = app.get(prisma_service_1.PrismaService);
    await prismaService.enableShutdownHooks(app);
    const port = Number(process.env.PORT) || 3000;
    await app.listen(port);
    const logger = new common_2.Logger('Bootstrap');
    logger.log(`Application started on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map