import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Documentação Interativa OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('SogrAI API')
    .setDescription(
      'Plataforma de auditoria automatizada e comitê multi-agente de Code Review para Pull Requests no Azure DevOps e GitHub.'
    )
    .setVersion('1.0.0')
    .addTag('Reviews', 'Auditoria de PRs, fila assíncrona FIFO e pareceres técnicos')
    .addTag('GitHub', 'Integração com repositórios GitHub e criação de issues')
    .addTag('Azure DevOps', 'Exploração de projetos, repositórios e PRs do Azure')
    .addTag('Pending Items', 'Gestão de débitos técnicos e pendências por arquivo')
    .addTag('Settings', 'Configurações de sistema, chaves de API e tokens')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SogrAI API Docs',
  });

  const port = process.env.PORT || 5001;
  await app.listen(port);
  logger.log(`👵 SogrAI Backend (NestJS) rodando na porta ${port}!`);
  logger.log(`📖 Documentação Swagger disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
