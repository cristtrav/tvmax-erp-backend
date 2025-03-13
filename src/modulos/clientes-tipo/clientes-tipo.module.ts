import { Module } from '@nestjs/common';
import { ClientesTipoController } from './controller/clientes-tipo.controller';
import { ClientesTipoService } from './service/clientes-tipo.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteTipo } from '@database/entity/cliente-tipo.entity';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
    imports: [
        JwtModule.register({}),
        TypeOrmModule.forFeature([
            ClienteTipo,
            Permiso
        ])
    ],
    controllers: [ClientesTipoController],
    providers: [ClientesTipoService]
})
export class ClientesTipoModule {}
