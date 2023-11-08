import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  const certLocation = process.env.SSL_CERT_FOLDER ?? join(__dirname, '..', 'ssl');
  const app = process.env.SERVER_MODE == 'https' 
  ? await NestFactory.create(AppModule, { httpsOptions: {
      key: fs.readFileSync(join(certLocation, 'privkey.pem')),
      cert: fs.readFileSync(join(certLocation, 'cert.pem'))
    }
  })
  : await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
