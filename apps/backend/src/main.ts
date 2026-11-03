import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  // Prefijo global de API versionada
  app.setGlobalPrefix('api/v1');

  // CORS habilitado para frontend de desarrollo y producción
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Tubería global de validación y sanitización DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Documentación OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('CTS Academy & Evaluator API')
    .setDescription(
      'Plataforma integral de evaluación de admisión técnica, gestión de equipos y capacitación continua (CTS / UNEATLANTICO).',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese el token JWT Bearer',
        in: 'header',
      },
      'bearer',
    )
    .addTag('PK01 - Acceso', 'Autenticación y sesiones (CUs: iniciarSesion, cerrarSesion)')
    .addTag('PK02 - MotorEvaluacion', 'Evaluación de postulantes y admisiones (12 CUs)')
    .addTag('PK03 - MotorFormacion', 'Entregables, capacitaciones y banco de preguntas (17 CUs)')
    .addTag('PK04 - MotorEquipos', 'Liderazgo operativo, admisiones y periodos de corte (4 CUs)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(port, host);
  logger.log(`================================================================`);
  logger.log(`🚀 CTS Academy API Backend iniciado exitosamente en puerto ${port}`);
  logger.log(`📖 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
  logger.log(`📡 Endpoints base en: http://localhost:${port}/api/v1`);
  logger.log(`================================================================`);
}

bootstrap();
