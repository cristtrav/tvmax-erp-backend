import { AjusteExistenciaView } from '@database/view/depositos/ajuste-existencia.view';
import { AjusteExistenciaDTO } from '@dto/depositos/ajuste-existencia.dto';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ConsultarAjustesService } from '../service/consultar-ajustes.service';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { AjusteExistencia } from '@database/entity/depositos/ajuste-existencia.entity';
import { RegistrarAjustesService } from '../service/registrar-ajustes.service';
import { EditarAjustesService } from '../service/editar-ajustes.service';
import { EliminarAjustesService } from '../service/eliminar-ajustes.service';
import { AjusteMaterialIdentificable } from '@database/entity/depositos/ajuste-material-identificable.entity';
import { AjusteMaterialIdentificableView } from '@database/view/depositos/ajuste-material-identificable.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('ajustesexistencias')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class AjustesExistenciasController {

    constructor(
        private consultarAjustesSrv: ConsultarAjustesService,
        private registrarAjustesSrv: RegistrarAjustesService,
        private editarAjustesSrv: EditarAjustesService,
        private eliminarAjusteSrv: EliminarAjustesService,
        private jwtUtilSrv: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(Permissions.AJUSTESEXISTENCIASMATERIALES.CONSULTAR)
    findAll(
        @Query() queries: QueriesType
    ): Promise<AjusteExistenciaView[]>{
        return this.consultarAjustesSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.AJUSTESEXISTENCIASMATERIALES.CONSULTAR)
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.consultarAjustesSrv.count(queries);
    }

    @Get('identificables')
    @AllowedIn(Permissions.AJUSTESEXISTENCIASMATERIALES.CONSULTAR)
    findAllAjustesIdentificables(
        @Query() queries: QueriesType
    ): Promise<AjusteMaterialIdentificableView[]>{
        return this.consultarAjustesSrv.findAllAjustesIdentificables(queries);
    } 

    @Get(':id')
    @AllowedIn(Permissions.AJUSTESEXISTENCIASMATERIALES.CONSULTAR)
    findById(
        @Param('id') id: number
    ): Promise<AjusteExistenciaView>{
        return this.consultarAjustesSrv.findById(id);
    }

    @Post()
    @AllowedIn(Permissions.AJUSTESEXISTENCIASMATERIALES.REGISTRAR)
    async create(
        @Body() ajusteDto: AjusteExistenciaDTO,
        @Headers('authorization') auth: string
    ): Promise<number>{
        const ajuste = new AjusteExistencia(ajusteDto);
        const idusuario = this.jwtUtilSrv.extractJwtSub(auth);
        const ajustesIdentificables = ajusteDto?.ajustesmaterialesidentificables
            ?.map(amiDto => new AjusteMaterialIdentificable(amiDto));

        return await this.registrarAjustesSrv.create(ajuste, idusuario, ajustesIdentificables);
    }

    @Put(':id')
    @AllowedIn(Permissions.AJUSTESEXISTENCIASMATERIALES.EDITAR)
    async edit(
        @Param('id') id: number,
        @Body() ajusteDto: AjusteExistenciaDTO,
        @Headers('authorization') auth: string
    ){
        const ajusteExistencia = new AjusteExistencia(ajusteDto);
        const idusuario = this.jwtUtilSrv.extractJwtSub(auth);
        const ajusteIdentificables = ajusteDto?.ajustesmaterialesidentificables
            ?.map(amiDto => new AjusteMaterialIdentificable(amiDto))
        
        await this.editarAjustesSrv.editar(id, ajusteExistencia, idusuario, ajusteIdentificables);
    }

    @Delete(':id')
    @AllowedIn(Permissions.AJUSTESEXISTENCIASMATERIALES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        const idusuario = this.jwtUtilSrv.extractJwtSub(auth);
        await this.eliminarAjusteSrv.eliminar(id, idusuario);
    }

}

type QueriesType = {[name:string]: any}
