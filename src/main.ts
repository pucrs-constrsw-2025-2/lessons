import './instrumentation';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UnauthorizedException } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Prefixo global de API
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Lessons API')
    .setDescription('API para gerenciamento de aulas e assuntos')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
  
  // Aplicar middleware de autenticação globalmente
  const authMiddleware = new AuthMiddleware();
  app.use(async (req, res, next) => {
    // Excluir rotas que não precisam de autenticação
    if (
      (req.path === '/' || req.path === '/api/v1/health' || req.path.startsWith('/api/v1/docs')) &&
      req.method === 'GET'
    ) {
      return next();
    }
    
    // Verificar se há token no header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Missing bearer token',
        error: 'Unauthorized',
      });
    }
    
    try {
      await authMiddleware.use(req, res, next);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof HttpException) {
        const status = error.getStatus ? error.getStatus() : HttpStatus.UNAUTHORIZED;
        const message = error.message || 'Unauthorized';
        return res.status(status).json({
          statusCode: status,
          message: message,
          error: error.name || 'Unauthorized',
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  });
  
  // Prefer the explicit internal port configured in docker-compose (LESSONS_INTERNAL_API_PORT)
  const port = process.env.PORT ?? process.env.LESSONS_INTERNAL_API_PORT ?? 3000;
  const host = '0.0.0.0';
  
  await app.listen(port, host);
}
bootstrap();
