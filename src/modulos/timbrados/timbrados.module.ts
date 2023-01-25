import { DatabaseService } from '@database/database.service';
import { Timbrado } from '@database/entity/timbrado.entity';
import { TimbradoView } from '@database/view/timbrado.view';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@util/util.module';
import { TimbradosController } from './timbrados.controller';
import { TimbradosService } from './timbrados.service';

@Module({
    imports: [
        JwtModule.register({}),
        UtilModule,
        TypeOrmModule.forFeature([Timbrado, TimbradoView])
    ],
    controllers: [TimbradosController],
    providers: [TimbradosService, DatabaseService]
})
export class TimbradosModule { }
