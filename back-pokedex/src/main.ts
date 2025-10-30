import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

//valida rla data viene  del front
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    }),
  )

const config = new DocumentBuilder()
.setTitle('Pokedex')
.setDescription('APIRest para la pokedex')
.setVersion('1.0')
.build()

const content = SwaggerModule.createDocument(app , config);

app.use('/docs', apiReference({
  content: content
}))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
