import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = process.env.SERVER_MODE == 'https' 
  ? await NestFactory.create(AppModule, { httpsOptions: {
      key: fs.readFileSync(join(__dirname, '..', 'ssl', 'privkey.pem')),
      cert: fs.readFileSync(join(__dirname, '..', 'ssl', 'cert.pem'))
    }
  })
  : await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
