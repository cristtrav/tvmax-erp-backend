import { DTE } from '@database/entity/facturacion/dte.entity';
import { mkdir, mkdtemp, readdir, readFile, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { DteXmlStorageService } from './dte-xml-storage.service';
import { DteXmlUtilsService } from './dte-xml-utils.service';

const CDC = '01800290097001002001762812026052719463602901';

const getXml = (cdc: string, contenido: string = 'original') => `<?xml version="1.0" standalone="yes"?>
<rDE xmlns="http://ekuatia.set.gov.py/sifen/xsd">
  <dVerFor>150</dVerFor>
  <DE Id="${cdc}"><dDesPro>${contenido} ñ</dDesPro></DE>
</rDE>`;

const getDte = (id: number, cdc: string | null): DTE => ({ id, cdc } as DTE);

describe('DteXmlStorageService', () => {

    let carpeta: string;
    let datasource: { query: jest.Mock };
    let service: DteXmlStorageService;
    const carpetaOriginal = process.env.DTE_XML_FOLDER;

    beforeEach(async () => {
        carpeta = await mkdtemp(join(tmpdir(), 'dte-xml-'));
        process.env.DTE_XML_FOLDER = carpeta;
        datasource = { query: jest.fn() };
        service = new DteXmlStorageService(new DteXmlUtilsService(), datasource as any);
    });

    afterEach(async () => {
        await rm(carpeta, { recursive: true, force: true });
        process.env.DTE_XML_FOLDER = carpetaOriginal;
    });

    describe('onModuleInit', () => {
        it('falla si DTE_XML_FOLDER no está definida', () => {
            delete process.env.DTE_XML_FOLDER;
            expect(() => service.onModuleInit()).toThrow('DTE_XML_FOLDER no está definida');
        });

        it('falla si DTE_XML_FOLDER no existe', () => {
            process.env.DTE_XML_FOLDER = join(carpeta, 'no-existe');
            expect(() => service.onModuleInit()).toThrow('DTE_XML_FOLDER no existe');
        });

        it('acepta una carpeta válida', () => {
            expect(() => service.onModuleInit()).not.toThrow();
        });
    });

    describe('getRuta', () => {
        it('organiza por año y mes de emisión del CDC', () => {
            expect(service.getRuta(CDC)).toBe(join(carpeta, '2026', '05', `${CDC}.xml`));
        });

        it('rechaza un CDC inválido', () => {
            expect(() => service.getRuta('123')).toThrow('CDC inválido');
        });
    });

    describe('guardar', () => {
        it('escribe el XML sin modificarlo y retorna el CDC', async () => {
            const xml = getXml(CDC);
            expect(await service.guardar(xml)).toBe(CDC);

            const ruta = service.getRuta(CDC);
            expect(await readFile(ruta, 'utf-8')).toBe(xml);
            expect((await stat(ruta)).mode & 0o777).toBe(0o640);
            expect(await readdir(join(carpeta, '2026', '05'))).toEqual([`${CDC}.xml`]);
        });

        it('no hace nada si el archivo ya existe con el mismo contenido', async () => {
            await service.guardar(getXml(CDC));
            await expect(service.guardar(getXml(CDC))).resolves.toBe(CDC);
        });

        it('no sobrescribe un archivo existente con contenido distinto', async () => {
            await service.guardar(getXml(CDC, 'original'));
            await expect(service.guardar(getXml(CDC, 'modificado'))).rejects.toMatchObject({
                response: { message: `Ya existe un XML distinto almacenado para el CDC «${CDC}»` }
            });
            expect(await readFile(service.getRuta(CDC), 'utf-8')).toBe(getXml(CDC, 'original'));
        });

        it('rechaza un XML sin CDC válido', async () => {
            await expect(service.guardar(getXml('123'))).rejects.toMatchObject({
                response: { message: 'No se puede guardar el XML del DTE: CDC inválido «123»' }
            });
        });

        it('admite escrituras concurrentes del mismo XML', async () => {
            const resultados = await Promise.all([1, 2, 3, 4, 5].map(() => service.guardar(getXml(CDC))));
            expect(resultados).toEqual([CDC, CDC, CDC, CDC, CDC]);
            expect(await readdir(join(carpeta, '2026', '05'))).toEqual([`${CDC}.xml`]);
        });
    });

    describe('leer', () => {
        it('lee el XML desde disco sin consultar la base de datos', async () => {
            await service.guardar(getXml(CDC));
            expect(await service.leer(getDte(1, CDC))).toBe(getXml(CDC));
            expect(datasource.query).not.toHaveBeenCalled();
        });

        it('recupera desde la base de datos, escribe el archivo y completa el cdc', async () => {
            datasource.query.mockResolvedValueOnce([{ xml: getXml(CDC) }]).mockResolvedValueOnce([[], 1]);
            const dte = getDte(7, null);

            expect(await service.leer(dte)).toBe(getXml(CDC));
            expect(await readFile(service.getRuta(CDC), 'utf-8')).toBe(getXml(CDC));
            expect(dte.cdc).toBe(CDC);
            expect(datasource.query).toHaveBeenCalledTimes(2);
            expect(datasource.query.mock.calls[1][0]).toContain('FOR UPDATE SKIP LOCKED');
            expect(datasource.query.mock.calls[1][1]).toEqual([7, CDC]);
        });

        it('recupera desde la base de datos si falta el archivo de un DTE con cdc', async () => {
            datasource.query.mockResolvedValueOnce([{ xml: getXml(CDC) }]);

            expect(await service.leer(getDte(7, CDC))).toBe(getXml(CDC));
            expect(await readFile(service.getRuta(CDC), 'utf-8')).toBe(getXml(CDC));
            expect(datasource.query).toHaveBeenCalledTimes(1);
        });

        it('falla si el cdc del DTE no coincide con el de su XML', async () => {
            const otroCdc = CDC.replace(/^01/, '05');
            datasource.query.mockResolvedValueOnce([{ xml: getXml(CDC) }]);

            await expect(service.leer(getDte(7, otroCdc))).rejects.toMatchObject({
                response: { message: `El CDC del DTE «7» (${otroCdc}) no coincide con el de su XML (${CDC})` }
            });
        });

        it('falla si el XML no está en disco ni en la base de datos', async () => {
            datasource.query.mockResolvedValueOnce([{ xml: null }]);

            await expect(service.leer(getDte(7, CDC))).rejects.toMatchObject({
                response: { message: `No se encontró el XML del DTE «7» (CDC: ${CDC})` }
            });
        });

        it('getRutaArchivo retorna la ruta sin consultar la base de datos si el archivo existe', async () => {
            await service.guardar(getXml(CDC));
            expect(await service.getRutaArchivo(getDte(1, CDC))).toBe(service.getRuta(CDC));
            expect(datasource.query).not.toHaveBeenCalled();
        });

        it('getRutaArchivo recupera el archivo desde la base de datos si falta', async () => {
            datasource.query.mockResolvedValueOnce([{ xml: getXml(CDC) }]).mockResolvedValueOnce([[], 1]);
            const dte = getDte(7, null);

            expect(await service.getRutaArchivo(dte)).toBe(service.getRuta(CDC));
            expect(await readFile(service.getRuta(CDC), 'utf-8')).toBe(getXml(CDC));
            expect(dte.cdc).toBe(CDC);
        });

        it('getCdc retorna el cdc del DTE sin leer el archivo ni la base de datos', async () => {
            expect(await service.getCdc(getDte(1, CDC))).toBe(CDC);
            expect(datasource.query).not.toHaveBeenCalled();
        });

        it('getCdc obtiene el CDC desde el XML si la columna cdc no está completa', async () => {
            datasource.query.mockResolvedValueOnce([{ xml: getXml(CDC) }]).mockResolvedValueOnce([[], 1]);
            const dte = getDte(7, null);

            expect(await service.getCdc(dte)).toBe(CDC);
            expect(dte.cdc).toBe(CDC);
        });

        it('propaga errores de lectura distintos a archivo inexistente', async () => {
            //La ruta del archivo es un directorio: readFile falla con EISDIR
            await mkdir(service.getRuta(CDC), { recursive: true });

            await expect(service.leer(getDte(1, CDC))).rejects.toMatchObject({ code: 'EISDIR' });
            expect(datasource.query).not.toHaveBeenCalled();
        });
    });

});
