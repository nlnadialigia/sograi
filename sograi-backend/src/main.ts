import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('SogrAI-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para o frontend React (Vite: http://localhost:5173)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Validação automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 5001;
  await app.listen(port);
  logger.log(`👵 SogrAI Backend (NestJS) rodando na porta ${port}!`);
}

bootstrap();
