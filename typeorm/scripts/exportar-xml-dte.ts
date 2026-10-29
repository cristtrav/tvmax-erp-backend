/**
 * Fase 2 de la transición del XML de DTE a archivos en disco (ver docs/plan-transicion-xml-dte.md).
 *
 * Uso:
 *   npm run dte:exportar-xml                       Exporta los XML que faltan en disco y completa la columna cdc
 *   npm run dte:exportar-xml -- --dry-run          Muestra lo que haría, sin escribir
 *   npm run dte:exportar-xml -- --verificar        Compara todos los DTE contra sus archivos
 *   npm run dte:exportar-xml -- --huerfanos        Lista archivos sin DTE asociado o en ubicación incorrecta
 *   npm run dte:exportar-xml -- --restaurar        Copia los archivos a la columna xml de los DTE que no la tienen
 *
 * La carpeta de destino se lee de DTE_XML_FOLDER, en el .env de la raíz del proyecto.
 * Es idempotente: puede ejecutarse varias veces y retomarse si se interrumpe.
 */
import { config } from 'dotenv';
import { createHash } from 'crypto';
import { mkdir, readFile, readdir, rename, writeFile } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { DataSource } from 'typeorm';
import { DteXmlRutaUtil } from '../../src/modulos/sifen/sifen-utils/services/dte/dte-xml-ruta.util';

//Ruta explícita: config() sin ruta lee el .env de la carpeta actual
config({ path: join(__dirname, '..', '..', '.env') });

type Modo = 'exportar' | 'verificar' | 'huerfanos' | 'restaurar';

interface FilaDte {
    id: string;
    xml: string | null;
    cdc_xml: string | null;
    cdc: string | null;
}

interface Resumen {
    procesados: number;
    escritos: number;
    existentes: number;
    cdcCompletados: number;
    restaurados: number;
    errores: number;
}

const TAMANIO_LOTE = 500;

const XPATH_CDC = `(xpath('/s:rDE/s:DE/@Id', xml, ARRAY[ARRAY['s', 'http://ekuatia.set.gov.py/sifen/xsd']]))[1]::text`;

const OPCIONES_MODO: Record<string, Modo> = {
    '--verificar': 'verificar',
    '--huerfanos': 'huerfanos',
    '--restaurar': 'restaurar'
};

const resumen: Resumen = {
    procesados: 0,
    escritos: 0,
    existentes: 0,
    cdcCompletados: 0,
    restaurados: 0,
    errores: 0
};

async function main(){
    const args = process.argv.slice(2);
    const opcionesInvalidas = args.filter(a => a != '--dry-run' && OPCIONES_MODO[a] == null);
    const modos = args.filter(a => OPCIONES_MODO[a] != null).map(a => OPCIONES_MODO[a]);
    if(opcionesInvalidas.length > 0 || modos.length > 1){
        console.error(`Opciones inválidas: ${args.join(' ')}`);
        console.error('Uso: npm run dte:exportar-xml -- [--dry-run] [--verificar | --huerfanos | --restaurar]');
        process.exit(2);
    }
    const modo: Modo = modos[0] ?? 'exportar';
    const dryRun = args.includes('--dry-run');
    if(dryRun && (modo == 'verificar' || modo == 'huerfanos'))
        console.warn(`--dry-run no tiene efecto en el modo ${modo} (solo lectura)`);

    const carpetaBase = process.env.DTE_XML_FOLDER;
    try{
        DteXmlRutaUtil.validarCarpetaBase(carpetaBase, modo == 'exportar' && !dryRun);
    }catch(e){
        console.error(e.message);
        process.exit(2);
    }

    console.log(`Modo: ${modo}${dryRun ? ' (dry-run, no se escribe nada)' : ''}`);
    console.log(`Carpeta: ${carpetaBase}`);

    const datasource = new DataSource({
        type: 'postgres',
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT),
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE
    });
    await datasource.initialize();

    const inicio = Date.now();
    try{
        const tieneColumnaCdc = await existeColumnaCdc(datasource);
        if(!tieneColumnaCdc) console.log('La columna facturacion.dte.cdc aún no existe (migración de la fase 1 pendiente)');

        switch(modo){
            case 'exportar': await exportar(datasource, carpetaBase, tieneColumnaCdc, dryRun); break;
            case 'verificar': await verificar(datasource, carpetaBase, tieneColumnaCdc); break;
            case 'huerfanos': await listarHuerfanos(datasource, carpetaBase, tieneColumnaCdc); break;
            case 'restaurar': await restaurar(datasource, carpetaBase, tieneColumnaCdc, dryRun); break;
        }
    }finally{
        await datasource.destroy();
    }

    console.log('');
    console.log(`Resumen (${modo}${dryRun ? ', dry-run' : ''}) en ${((Date.now() - inicio) / 1000).toFixed(1)} s`);
    console.log(`  Procesados:        ${resumen.procesados}`);
    if(modo == 'exportar'){
        console.log(`  ${dryRun ? 'A escribir:       ' : 'Escritos:         '} ${resumen.escritos}`);
        console.log(`  Ya existentes:     ${resumen.existentes}`);
        console.log(`  ${dryRun ? 'CDC a completar:  ' : 'CDC completados:  '} ${resumen.cdcCompletados}`);
    }
    if(modo == 'restaurar') console.log(`  ${dryRun ? 'A restaurar:      ' : 'Restaurados:      '} ${resumen.restaurados}`);
    console.log(`  Errores:           ${resumen.errores}`);

    process.exitCode = resumen.errores > 0 ? 1 : 0;
}

async function existeColumnaCdc(datasource: DataSource): Promise<boolean> {
    const filas = await datasource.query(`
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'facturacion' AND table_name = 'dte' AND column_name = 'cdc'
    `);
    return filas.length > 0;
}

/**
 * Recorre los DTE por id, en lotes. El filtro adicional se aplica a cada lote.
 */
async function recorrerDtes(
    datasource: DataSource,
    tieneColumnaCdc: boolean,
    filtro: string,
    procesarLote: (filas: FilaDte[]) => Promise<void>
){
    const [{ total }] = await datasource.query(`SELECT COUNT(*)::int AS total FROM facturacion.dte WHERE ${filtro}`);
    console.log(`DTE a procesar: ${total}`);

    let ultimoId = '0';
    while(true){
        const filas: FilaDte[] = await datasource.query(`
            SELECT id, xml::text AS xml, ${XPATH_CDC} AS cdc_xml, ${tieneColumnaCdc ? 'cdc' : 'NULL::text AS cdc'}
            FROM facturacion.dte
            WHERE id > $1 AND ${filtro}
            ORDER BY id
            LIMIT $2
        `, [ultimoId, TAMANIO_LOTE]);
        if(filas.length == 0) break;

        await procesarLote(filas);
        resumen.procesados += filas.length;
        ultimoId = filas[filas.length - 1].id;
        console.log(`  ${resumen.procesados}/${total} (hasta id ${ultimoId}) - errores: ${resumen.errores}`);
    }
}

async function exportar(datasource: DataSource, carpetaBase: string, tieneColumnaCdc: boolean, dryRun: boolean){
    await recorrerDtes(datasource, tieneColumnaCdc, 'xml IS NOT NULL', async filas => {
        const cdcACompletar: { id: string, cdc: string }[] = [];

        await Promise.all(filas.map(async fila => {
            try{
                const cdc = getCdcFila(fila);
                const ruta = DteXmlRutaUtil.getRuta(carpetaBase, cdc);
                if(await exportarXml(ruta, fila.xml, cdc, dryRun)) resumen.escritos++;
                else resumen.existentes++;
                if(tieneColumnaCdc && fila.cdc == null) cdcACompletar.push({ id: fila.id, cdc });
            }catch(e){
                registrarError(fila, e);
            }
        }));

        if(cdcACompletar.length == 0) return;
        if(dryRun){
            resumen.cdcCompletados += cdcACompletar.length;
            return;
        }
        try{
            const [, cantidad] = await datasource.query(`
                UPDATE facturacion.dte AS dte
                SET cdc = v.cdc
                FROM unnest($1::bigint[], $2::varchar[]) AS v(id, cdc)
                WHERE dte.id = v.id AND dte.cdc IS NULL
            `, [cdcACompletar.map(c => c.id), cdcACompletar.map(c => c.cdc)]);
            resumen.cdcCompletados += cantidad;
        }catch(e){
            resumen.errores += cdcACompletar.length;
            console.error(`Error al completar cdc de los id ${cdcACompletar.map(c => c.id).join(', ')}: ${e.message}`);
        }
    });
}

/**
 * Escribe el XML de forma atómica (archivo temporal + rename) y verifica lo escrito.
 * Retorna true si se escribió, false si ya existía con el mismo contenido.
 */
async function exportarXml(ruta: string, xml: string, cdc: string, dryRun: boolean): Promise<boolean> {
    const contenido = Buffer.from(xml, 'utf-8');
    const existente = await leerSiExiste(ruta);
    if(existente != null){
        if(sha256(existente) != sha256(contenido))
            throw new Error(`El archivo ya existe con contenido distinto: ${ruta}`);
        return false;
    }
    if(dryRun) return true;

    await mkdir(dirname(ruta), { recursive: true, mode: 0o750 });
    const rutaTmp = `${ruta}.tmp`;
    await writeFile(rutaTmp, contenido, { mode: 0o640 });
    await rename(rutaTmp, ruta);

    const escrito = await readFile(ruta);
    if(sha256(escrito) != sha256(contenido))
        throw new Error(`El hash SHA-256 del archivo escrito no coincide con la base de datos: ${ruta}`);
    const cdcArchivo = extraerCdc(escrito.toString('utf-8'));
    if(cdcArchivo != cdc)
        throw new Error(`El CDC del archivo escrito («${cdcArchivo}») no coincide con «${cdc}»: ${ruta}`);
    return true;
}

async function verificar(datasource: DataSource, carpetaBase: string, tieneColumnaCdc: boolean){
    await recorrerDtes(datasource, tieneColumnaCdc, 'TRUE', async filas => {
        await Promise.all(filas.map(async fila => {
            try{
                if(tieneColumnaCdc && fila.cdc == null)
                    throw new Error('Columna cdc sin completar');

                if(fila.xml != null){
                    const cdc = getCdcFila(fila);
                    const ruta = DteXmlRutaUtil.getRuta(carpetaBase, cdc);
                    const archivo = await leerSiExiste(ruta);
                    if(archivo == null) throw new Error(`No existe el archivo: ${ruta}`);
                    if(sha256(archivo) != sha256(Buffer.from(fila.xml, 'utf-8')))
                        throw new Error(`El contenido del archivo no coincide con la base de datos: ${ruta}`);
                }else{
                    //DTE cuyo XML ya solo está en disco
                    const ruta = DteXmlRutaUtil.getRuta(carpetaBase, fila.cdc);
                    const archivo = await leerSiExiste(ruta);
                    if(archivo == null) throw new Error(`No existe el archivo: ${ruta}`);
                    const cdcArchivo = extraerCdc(archivo.toString('utf-8'));
                    if(cdcArchivo != fila.cdc)
                        throw new Error(`El CDC del archivo («${cdcArchivo}») no coincide con la columna cdc: ${ruta}`);
                }
            }catch(e){
                registrarError(fila, e);
            }
        }));
    });
}

async function listarHuerfanos(datasource: DataSource, carpetaBase: string, tieneColumnaCdc: boolean){
    const filas: { cdc: string }[] = await datasource.query(tieneColumnaCdc ?
        `SELECT COALESCE(cdc, ${XPATH_CDC}) AS cdc FROM facturacion.dte` :
        `SELECT ${XPATH_CDC} AS cdc FROM facturacion.dte`
    );
    const cdcsRegistrados = new Set(filas.map(f => f.cdc).filter(cdc => cdc != null));
    console.log(`CDC registrados en la base de datos: ${cdcsRegistrados.size}`);

    const hallazgos: string[] = [];
    for(const ruta of await listarArchivos(carpetaBase)){
        resumen.procesados++;
        const nombre = relative(carpetaBase, ruta);
        const coincidencia = /(\d{44})\.xml$/.exec(ruta);

        if(ruta.endsWith('.tmp')) hallazgos.push(`Temporal sin terminar: ${nombre}`);
        else if(coincidencia == null) hallazgos.push(`Archivo desconocido: ${nombre}`);
        else if(DteXmlRutaUtil.getRuta(carpetaBase, coincidencia[1]) != ruta) hallazgos.push(`Ubicación incorrecta: ${nombre}`);
        else if(!cdcsRegistrados.has(coincidencia[1])) hallazgos.push(`Huérfano (CDC no registrado): ${nombre}`);
    }

    console.log(`Archivos revisados: ${resumen.procesados}. Hallazgos: ${hallazgos.length}`);
    hallazgos.forEach(h => console.log(`  ${h}`));
}

async function restaurar(datasource: DataSource, carpetaBase: string, tieneColumnaCdc: boolean, dryRun: boolean){
    if(!tieneColumnaCdc){
        console.log('Sin columna cdc no hay DTE sin XML en la base de datos. Nada que restaurar.');
        return;
    }
    await recorrerDtes(datasource, tieneColumnaCdc, 'xml IS NULL', async filas => {
        for(const fila of filas){
            try{
                const ruta = DteXmlRutaUtil.getRuta(carpetaBase, fila.cdc);
                const archivo = await leerSiExiste(ruta);
                if(archivo == null) throw new Error(`No existe el archivo: ${ruta}`);
                const xml = archivo.toString('utf-8');
                const cdcArchivo = extraerCdc(xml);
                if(cdcArchivo != fila.cdc)
                    throw new Error(`El CDC del archivo («${cdcArchivo}») no coincide con la columna cdc: ${ruta}`);
                if(!dryRun) await datasource.query(
                    `UPDATE facturacion.dte SET xml = $2::xml WHERE id = $1 AND xml IS NULL`,
                    [fila.id, xml]
                );
                resumen.restaurados++;
            }catch(e){
                registrarError(fila, e);
            }
        }
    });
}

function getCdcFila(fila: FilaDte): string {
    if(!DteXmlRutaUtil.esCdcValido(fila.cdc_xml))
        throw new Error(`No se pudo obtener un CDC válido del XML («${fila.cdc_xml}»)`);
    if(fila.cdc != null && fila.cdc != fila.cdc_xml)
        throw new Error(`La columna cdc («${fila.cdc}») no coincide con el CDC del XML («${fila.cdc_xml}»)`);
    return fila.cdc_xml;
}

function extraerCdc(xml: string): string | null {
    return /<DE\s[^>]*\bId="([^"]*)"/.exec(xml)?.[1] ?? null;
}

async function leerSiExiste(ruta: string): Promise<Buffer | null> {
    try{
        return await readFile(ruta);
    }catch(e){
        if(e.code == 'ENOENT') return null;
        throw e;
    }
}

async function listarArchivos(carpeta: string): Promise<string[]> {
    const archivos: string[] = [];
    for(const entrada of await readdir(carpeta, { withFileTypes: true })){
        const ruta = join(carpeta, entrada.name);
        if(entrada.isDirectory()) archivos.push(...await listarArchivos(ruta));
        else archivos.push(ruta);
    }
    return archivos;
}

function sha256(contenido: Buffer): string {
    return createHash('sha256').update(contenido).digest('hex');
}

function registrarError(fila: FilaDte, e: Error){
    resumen.errores++;
    console.error(`  [ERROR] id ${fila.id}, cdc ${fila.cdc ?? fila.cdc_xml ?? '-'}: ${e.message}`);
}

main().catch(e => {
    console.error('Error fatal:', e);
    process.exit(1);
});
