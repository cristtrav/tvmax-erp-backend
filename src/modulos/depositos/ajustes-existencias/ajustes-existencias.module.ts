import { Module } from '@nestjs/common';
import { AjustesExistenciasController } from './controller/ajustes-existencias.controller';
import { ConsultarAjustesService } from './service/consultar-ajustes.service';
import { EditarAjustesService } from './service/editar-ajustes.service';
import { EliminarAjustesService } from './service/eliminar-ajustes.service';
import { RegistrarAjustesService } from './service/registrar-ajustes.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AjusteExistencia } from '@database/entity/depositos/ajuste-existencia.entity';
import { AjusteExistenciaView } from '@database/view/depositos/ajuste-existencia.view';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { AjusteMaterialIdentificable } from '@database/entity/depositos/ajuste-material-identificable.entity';
import { AjusteMaterialIdentificableView } from '@database/view/depositos/ajuste-material-identificable.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
    imports: [
        JwtModule.register({}),
        TypeOrmModule.forFeature([
            AjusteExistencia,
            AjusteExistenciaView,
            Existencia,
            AjusteMaterialIdentificable,
            AjusteMaterialIdentificableView,
            Permiso
        ])
    ],
    controllers: [AjustesExistenciasController],
    providers: [
        ConsultarAjustesService,
        EditarAjustesService,
        EliminarAjustesService,
        RegistrarAjustesService
    ]
})
export class AjustesExistenciasModule {}
