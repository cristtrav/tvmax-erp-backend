import { Module } from '@nestjs/common';
import { ResumenesSuscripcionesService } from './resumenes-suscripciones.service';
import { ResumenesSuscripcionesController } from './resumenes-suscripciones.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@util/util.module';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { DatabaseService } from '@database/database.service';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
    imports: [
        JwtModule.register({}),
        TypeOrmModule.forFeature([
            Suscripcion,
            SuscripcionView,
            Permiso
        ]),
        UtilModule
    ],
    providers: [ResumenesSuscripcionesService, DatabaseService],
    controllers: [ResumenesSuscripcionesController]
})
export class ResumenesSuscripcionesModule { }
