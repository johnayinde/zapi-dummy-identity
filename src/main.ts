import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api-hub')
  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))

  if (process.env.NODE_ENV !== "production") {
    const options = new DocumentBuilder()
      .setTitle('ZA Hub')
      .setDescription('Zummit Africa API hub User Registration')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api-hub', app, document)
  }
  
  await app.listen(Number(process.env.NODE_PORT) ||3000);
}
bootstrap();
