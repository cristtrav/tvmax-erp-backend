import { DTE } from '@database/entity/facturacion/dte.entity';
import { HttpException, HttpStatus, Injectable, Logger, LoggerService, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { DataSource } from 'typeorm';
import { DteXmlRutaUtil } from './dte-xml-ruta.util';
import { DteXmlUtilsService } from './dte-xml-utils.service';

/**
 * Almacenamiento en disco de los XML de DTE.
 * Ruta: {DTE_XML_FOLDER}/{AAAA}/{MM}/{CDC}.xml (ver docs/plan-transicion-xml-dte.md)
 * Los archivos son inmutables: un CDC identifica a un único documento firmado.
 */
@Injectable()
export class DteXmlStorageService implements OnModuleInit {

    private readonly logger: LoggerService = new Logger(DteXmlStorageService.name);

    constructor(
        private dteXmlUtilsSrv: DteXmlUtilsService,
        private datasource: DataSource
    ){}

    onModuleInit() {
        //Falla al iniciar la aplicación si la carpeta no es usable
        DteXmlRutaUtil.validarCarpetaBase(this.getCarpetaBase());
        this.logger.log(`Almacenamiento de XML de DTE en: ${this.getCarpetaBase()}`);
    }

    public getRuta(cdc: string): string {
        return DteXmlRutaUtil.getRuta(this.getCarpetaBase(), cdc);
    }

    /**
     * Guarda el XML en disco y retorna su CDC.
     * Si el archivo ya existe con el mismo contenido no hace nada.
     * Nunca sobrescribe un archivo existente con contenido distinto.
     */
    public async guardar(xml: string): Promise<string> {
        const cdc = this.dteXmlUtilsSrv.getCDC(xml);
        if(!DteXmlRutaUtil.esCdcValido(cdc)) throw new HttpException({
            message: `No se puede guardar el XML del DTE: CDC inválido «${cdc}»`
        }, HttpStatus.INTERNAL_SERVER_ERROR);

        const ruta = this.getRuta(cdc);
        const contenido = Buffer.from(xml, 'utf-8');
        const existente = await this.leerArchivo(ruta);
        if(existente != null){
            if(existente.equals(contenido)) return cdc;
            throw new HttpException({
                message: `Ya existe un XML distinto almacenado para el CDC «${cdc}»`
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        //Escritura atómica: archivo temporal en la misma carpeta + rename
        await mkdir(dirname(ruta), { recursive: true, mode: 0o750 });
        const rutaTmp = `${ruta}.${randomUUID()}.tmp`;
        await writeFile(rutaTmp, contenido, { mode: 0o640, flag: 'wx' });
        try{
            await rename(rutaTmp, ruta);
        }catch(e){
            await unlink(rutaTmp).catch(() => null);
            throw e;
        }
        return cdc;
    }

    public async leer(dte: DTE): Promise<string> {
        if(dte.cdc != null){
            const contenido = await this.leerArchivo(this.getRuta(dte.cdc));
            if(contenido != null) return contenido.toString('utf-8');
        }
        return await this.recuperarDesdeBaseDatos(dte);
    }

    /**
     * TRANSICIÓN: eliminar en la fase 4, junto con la columna facturacion.dte.xml.
     * Para DTE que aún no tienen su archivo en disco (por ej. creados durante el deploy):
     * lee el XML de la base de datos, escribe el archivo y completa la columna cdc.
     */
    private async recuperarDesdeBaseDatos(dte: DTE): Promise<string> {
        const [fila] = await this.datasource.query(
            `SELECT xml::text AS xml FROM facturacion.dte WHERE id = $1`,
            [dte.id]
        );
        if(fila?.xml == null) throw new HttpException({
            message: `No se encontró el XML del DTE «${dte.id}» (CDC: ${dte.cdc ?? 'sin CDC'})`
        }, HttpStatus.INTERNAL_SERVER_ERROR);

        this.logger.warn(`DTE ${dte.id}: XML no encontrado en disco, se recupera desde la base de datos`);
        const cdc = await this.guardar(fila.xml);

        if(dte.cdc != null && dte.cdc != cdc) throw new HttpException({
            message: `El CDC del DTE «${dte.id}» (${dte.cdc}) no coincide con el de su XML (${cdc})`
        }, HttpStatus.INTERNAL_SERVER_ERROR);

        if(dte.cdc == null){
            //SKIP LOCKED: no espera si la fila está bloqueada por otra transacción
            //(por ej. la del propio llamador). En ese caso lo completa el script de exportación.
            await this.datasource.query(`
                UPDATE facturacion.dte SET cdc = $2
                WHERE id = (
                    SELECT id FROM facturacion.dte
                    WHERE id = $1 AND cdc IS NULL
                    FOR UPDATE SKIP LOCKED
                )
            `, [dte.id, cdc]);
            dte.cdc = cdc;
        }
        return fila.xml;
    }

    private getCarpetaBase(): string {
        return process.env.DTE_XML_FOLDER;
    }

    private async leerArchivo(ruta: string): Promise<Buffer | null> {
        try{
            return await readFile(ruta);
        }catch(e){
            if(e.code == 'ENOENT') return null;
            throw e;
        }
    }

}
