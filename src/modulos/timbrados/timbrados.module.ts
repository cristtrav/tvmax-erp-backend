import { DatabaseService } from '@database/database.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';
import { TimbradosController } from './timbrados.controller';
import { TimbradosService } from './timbrados.service';

@Module({
    imports: [
        JwtModule.register({}),
        UtilModule
    ],
    controllers: [TimbradosController],
    providers: [TimbradosService, DatabaseService]
})
export class TimbradosModule { }
