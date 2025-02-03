import { Permiso } from '@database/entity/permiso.entity';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TalonariosController } from './talonarios.controller';
import { TalonariosService } from './talonarios.service';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
    imports: [
        JwtModule.register({}),
        TypeOrmModule.forFeature([Talonario, TalonarioView, Permiso])
    ],
    controllers: [TalonariosController],
    providers: [TalonariosService, JwtUtilsService]
})
export class TalonariosModule { }
