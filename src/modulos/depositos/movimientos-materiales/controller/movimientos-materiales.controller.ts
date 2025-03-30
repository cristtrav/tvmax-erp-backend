import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { DetallesMovimientosMaterialesService } from '../service/detalles-movimientos-materiales.service';
import { DetalleMovimientoMaterialView } from '@database/view/depositos/detalle-movimiento-material.view';
import { MovimientoMaterialView } from '@database/view/depositos/movimiento-material.view';
import { Permissions } from '@auth/permission.list';
import { MovimientoMaterialDTO } from '@dto/depositos/movimiento-material.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { MovimientoMaterial } from '@database/entity/depositos/movimiento-material.entity';
import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { RegistrarMovimientoMaterial } from '../service/registrar-movimiento-material.service';
import { EliminarMovimientoMaterialService } from '../service/eliminar-movimiento-material.service';
import { EditarMovimientoMaterialService } from '../service/editar-movimiento-material.service';
import { ConsultarMovimientoMaterialesService } from '../service/consultar-movimiento-materiales.service';

@Controller('movimientosmateriales')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class MovimientosMaterialesController {

    constructor(
        //private movimientosMaterialesSrv: MovimientosMaterialesService,
        private consultarMovimientosMaterialesSrv: ConsultarMovimientoMaterialesService,
        private detallesMovimientosMaterialesSrv: DetallesMovimientosMaterialesService,
        private registrarMovimientoMaterialSrv: RegistrarMovimientoMaterial,
        private eliminarMovimientosMaterialesSrv: EliminarMovimientoMaterialService,
        private editarMovimientoMaterialSrv: EditarMovimientoMaterialService,
        private jwtUtilSrv: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<MovimientoMaterialView[]>{
        return this.consultarMovimientosMaterialesSrv.findAll(queries);
        //return this.movimientosMaterialesSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.consultarMovimientosMaterialesSrv.count(queries);
        //return this.movimientosMaterialesSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.REGISTRAR)
    async create(
        @Body() movimientoDto: MovimientoMaterialDTO,
        @Headers('authorization') auth: string
    ): Promise<number>{
        const movimiento = new MovimientoMaterial(movimientoDto);
        const detalles = movimientoDto.detalles.map(detalleDto => new DetalleMovimientoMaterial(detalleDto));
        const idusuario = this.jwtUtilSrv.extractJwtSub(auth);

        return await this.registrarMovimientoMaterialSrv.registrar(movimiento, detalles, idusuario);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO)
    async getLastId(
        @Query() queries: {[name: string]: any},
        @Headers('authorization') auth: string
    ): Promise<number>{
        return this.consultarMovimientosMaterialesSrv.getLastId(queries);
        //return this.movimientosMaterialesSrv.getLastId(queries);
    }
    
    @Get(':id/detalles')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOMODULO)
    findAllDetalles(
        @Query() queries: {[name: string]: any},
        @Param('id') id: number
    ): Promise<DetalleMovimientoMaterialView[]>{
        return this.detallesMovimientosMaterialesSrv.findByIdMovimiento(id, queries);
    }

    @Get(':id/detalles/total')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOMODULO)
    countDetalles(
        @Query() queries: {[name: string]: any},
        @Param('id') id: number
    ): Promise<number>{
        return this.detallesMovimientosMaterialesSrv.countByIdMovimiento(id, queries);
    }

    @Get(':id')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO)
    findById(
        @Param('id') id: number
    ): Promise<MovimientoMaterialView>{
        return this.consultarMovimientosMaterialesSrv.findById(id);
        //return this.movimientosMaterialesSrv.findById(id);
    }

    @Delete(':id')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        const idusuario = this.jwtUtilSrv.extractJwtSub(auth);
        await this.eliminarMovimientosMaterialesSrv.eliminar(id, idusuario);
        //await this.movimientosMaterialesSrv.delete(id, this.jwtUtilSrv.extractJwtSub(auth));
    }

    @Put()
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.EDITAR)
    async update(
        @Body() movimientoDto: MovimientoMaterialDTO,
        @Headers('authorization') auth: string
    ){
        const movimiento = new MovimientoMaterial(movimientoDto);
        const detalles = movimientoDto.detalles.map(detalleDto => new DetalleMovimientoMaterial(detalleDto));
        const idusuario = this.jwtUtilSrv.extractJwtSub(auth);
        
        this.editarMovimientoMaterialSrv.editar(movimiento, detalles, idusuario);
    }
}
