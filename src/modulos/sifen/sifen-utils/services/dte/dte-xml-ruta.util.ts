import { accessSync, constants, statSync } from 'fs';
import { isAbsolute, join } from 'path';

/**
 * Cálculo de rutas de los XML de DTE almacenados en disco.
 * Compartido por la aplicación y por el script typeorm/scripts/exportar-xml-dte.ts,
 * para que ambos calculen siempre la misma ruta.
 * Estructura: {carpetaBase}/{AAAA}/{MM}/{CDC}.xml (año y mes de la fecha de emisión del CDC)
 */
export class DteXmlRutaUtil {

    public static readonly CDC_REGEX = /^\d{44}$/;

    public static esCdcValido(cdc: string): boolean {
        return cdc != null && DteXmlRutaUtil.CDC_REGEX.test(cdc);
    }

    public static getRuta(carpetaBase: string, cdc: string): string {
        if(!DteXmlRutaUtil.esCdcValido(cdc)) throw new Error(`CDC inválido: «${cdc}»`);
        //Posiciones 26-33 del CDC: fecha de emisión AAAAMMDD
        const anio = cdc.substring(25, 29);
        const mes = cdc.substring(29, 31);
        return join(carpetaBase, anio, mes, `${cdc}.xml`);
    }

    /**
     * Valida la carpeta base. Lanza un error si no es usable.
     * Sin espacios: el jar de generación del KUDE no admite rutas con espacios.
     */
    public static validarCarpetaBase(carpetaBase: string, escritura: boolean = true): void {
        if(carpetaBase == null || carpetaBase.trim() == '')
            throw new Error('DTE_XML_FOLDER no está definida');
        if(!isAbsolute(carpetaBase))
            throw new Error(`DTE_XML_FOLDER debe ser una ruta absoluta: «${carpetaBase}»`);
        if(/\s/.test(carpetaBase))
            throw new Error(`DTE_XML_FOLDER no debe contener espacios: «${carpetaBase}»`);

        let esDirectorio = false;
        try{
            esDirectorio = statSync(carpetaBase).isDirectory();
        }catch(e){
            throw new Error(`DTE_XML_FOLDER no existe: «${carpetaBase}»`);
        }
        if(!esDirectorio) throw new Error(`DTE_XML_FOLDER no es un directorio: «${carpetaBase}»`);

        try{
            accessSync(carpetaBase, escritura ? constants.R_OK | constants.W_OK : constants.R_OK);
        }catch(e){
            throw new Error(`Sin permisos de ${escritura ? 'lectura/escritura' : 'lectura'} en DTE_XML_FOLDER: «${carpetaBase}»`);
        }
    }

}
