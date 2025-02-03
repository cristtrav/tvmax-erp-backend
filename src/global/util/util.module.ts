import { Global, Module } from '@nestjs/common';
import { DigitoVerificadorRucService } from './services/digito-verificador-ruc.service';
import { JwtUtilsService } from './services/jwt-utils.service';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
    providers: [
        DigitoVerificadorRucService,
        JwtUtilsService,
        JwtService
    ],
    exports: [
        DigitoVerificadorRucService,
        JwtUtilsService
    ]
})
export class UtilModule {}
