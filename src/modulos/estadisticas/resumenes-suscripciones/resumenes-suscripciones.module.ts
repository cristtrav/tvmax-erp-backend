import { Module } from '@nestjs/common';
import { ResumenesSuscripcionesService } from './resumenes-suscripciones.service';
import { ResumenesSuscripcionesController } from './resumenes-suscripciones.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@util/util.module';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

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
    providers: [ResumenesSuscripcionesService, JwtUtilsService],
    controllers: [ResumenesSuscripcionesController]
})
export class ResumenesSuscripcionesModule { }
