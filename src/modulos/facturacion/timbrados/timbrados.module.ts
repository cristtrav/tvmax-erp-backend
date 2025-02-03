import { Module } from '@nestjs/common';
import { FindAllTimbradosService } from './services/find-all-timbrados.service';
import { CountTimbradosService } from './services/count-timbrados.service';
import { FindAllTimbradosController } from './controllers/find-all-timbrados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timbrado } from '@database/entity/facturacion/timbrado.entity';
import { JwtModule } from '@nestjs/jwt';
import { Permiso } from '@database/entity/permiso.entity';
import { CountTimbradosController } from './controllers/count-timbrados.controller';
import { FindByNroTimbradoTimbradosController } from './controllers/find-by-nro-timbrado-timbrados.controller';
import { FindByNroTimbradoTimbradosService } from './services/find-by-nro-timbrado-timbrados.service';
import { TimbradoView } from '@database/view/facturacion/timbrado.view';
import { SaveTimbradoService } from './services/save-timbrado.service';
import { SaveTimbradoController } from './controllers/save-timbrado.controller';
import { EditTimbradoController } from './controllers/edit-timbrado.controller';
import { EditTimbradoService } from './services/edit-timbrado.service';
import { DeleteTimbradoService } from './services/delete-timbrado.service';
import { DeleteTimbradoController } from './controllers/delete-timbrado.controller';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      TimbradoView,
      Timbrado,
      Permiso
    ])
  ],
  providers: [
    FindAllTimbradosService,
    CountTimbradosService,
    FindByNroTimbradoTimbradosService,
    SaveTimbradoService,
    EditTimbradoService,
    DeleteTimbradoService
  ],
  controllers: [
    FindAllTimbradosController,
    CountTimbradosController,
    FindByNroTimbradoTimbradosController,
    SaveTimbradoController,
    EditTimbradoController,
    DeleteTimbradoController
  ]
})
export class TimbradosModule {}
