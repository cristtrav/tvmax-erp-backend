# Plan de transición: XML de `facturacion.dte` a archivos en disco

- **Estado:** Propuesta (sin implementar)
- **Rama:** `refactor/factura-electronica`
- **Fecha:** 2026-10-28

---

## 1. Objetivo

Dejar de almacenar el XML firmado de cada Documento Tributario Electrónico (DTE)
en la columna `facturacion.dte.xml` y guardarlo como archivo en disco, organizado
por año y mes. El archivo se identifica por el CDC (atributo `Id` de la etiqueta
`<DE Id="...">`). Los XML existentes se transfieren a archivos.

---

## 2. Diagnóstico (base de datos local `tvmax-erp`)

| Dato | Valor |
|---|---|
| Filas en `facturacion.dte` | 84.416 (FAC: 84.411, NCR: 5) |
| Tamaño de la tabla | 681 MB |
| XML como texto | 805 MB (493 MB comprimido en TOAST) |
| Tamaño por XML | promedio ~10 KB, máximo ~20 KB |
| Filas con `<DE Id>` | 84.416 (100 %), todos de 44 dígitos y **únicos** |
| CDC con fecha igual a `dFeEmiDE` | 84.416 (100 %) |
| Rango de fechas de emisión | 2024-12 a 2026-05 (18 meses) |
| Archivos por carpeta mensual | promedio 4.690, máximo 5.695 |
| Vistas, funciones o triggers que usan `dte.xml` | ninguno |

### Hallazgo: auditoría

`public.evento_auditoria` pesa **39 GB**, y **31 GB** son eventos de DTE
(`idtabla = 38`, 2,49 millones de eventos). `DTE.getEventoAuditoria()` serializa
la entidad completa, con el XML incluido, tanto en `estado_anterior` como en
`estado_nuevo`. Además, el envío de emails genera un evento por cada intento.
Si se quita `xml` de la entidad, el crecimiento se detiene solo (ver la fase 5
para los datos históricos).

### Otros puntos

- Al regenerar un DTE (`editar-venta.service.ts`, `generar-dte-lotes.service.ts`)
  se genera un código de seguridad aleatorio nuevo, **y por lo tanto un CDC
  nuevo**. La referencia al archivo debe guardarse en la fila y actualizarse.
- El deploy (`.github/workflows/main.yml`) hace
  `migration:run → build → pm2 restart`. Durante el build (1 a 2 min) el código
  viejo sigue atendiendo con el esquema ya migrado.

---

## 3. Organización de los archivos en disco

### Estructura

```
${DTE_XML_FOLDER}/
├── 2024/
│   └── 12/
│       ├── 01800290097001001000000112024120110123456781.xml
│       └── ...
├── 2025/
│   ├── 01/
│   ├── 02/
│   └── ...
└── 2026/
    ├── 01/
    └── 05/
        └── 01800290097001002001762812026052719463602901.xml
```

Ruta: `${DTE_XML_FOLDER}/{AAAA}/{MM}/{CDC}.xml`

### De dónde salen el año y el mes: del propio CDC

El CDC tiene posiciones fijas e incluye la fecha de emisión:

| Posición | Long. | Campo | Ejemplo |
|---|---|---|---|
| 1–2 | 2 | Tipo de documento | `01` |
| 3–10 | 8 | RUC del emisor | `80029009` |
| 11 | 1 | DV del RUC | `7` |
| 12–14 | 3 | Establecimiento | `001` |
| 15–17 | 3 | Punto de expedición | `002` |
| 18–24 | 7 | Número del documento | `0017628` |
| 25 | 1 | Tipo de contribuyente | `1` |
| **26–33** | **8** | **Fecha de emisión (AAAAMMDD)** | **`20260527`** |
| 34 | 1 | Tipo de emisión | `1` |
| 35–43 | 9 | Código de seguridad | `946360290` |
| 44 | 1 | Dígito verificador | `1` |

```ts
const anio = cdc.substring(25, 29); // "2026"
const mes  = cdc.substring(29, 31); // "05"
```

### Por qué usar la fecha del CDC (y no otra columna)

- **La ruta depende solo del CDC.** Con el CDC se encuentra el archivo; no hace
  falta guardar la ruta ni consultar otra tabla.
- **No cambia.** `fecha_cambio_estado` sí cambia, y la fecha de la venta podría
  editarse. La fecha del CDC es parte del documento firmado.
- **Verificado:** en el 100 % de las filas coincide con `dFeEmiDE`.
- Si una regeneración cambia la fecha, también cambia el CDC, y el archivo nuevo
  cae en su carpeta correcta. El archivo anterior se conserva como historial.

### Cómo afecta esto al plan

| Aspecto | Impacto |
|---|---|
| Esquema de base de datos | Ninguno: solo se guarda `cdc`. |
| `DteXmlStorageService` | `getRuta(cdc)` calcula la subcarpeta, y `guardar()` crea `AAAA/MM` si no existe (`mkdir` con `recursive: true`). |
| Escritura atómica | El archivo temporal se crea en la **misma** subcarpeta para que `rename` sea atómico (mismo sistema de archivos). |
| Script de exportación | Calcula la misma ruta. Crea 18 carpetas hoy, con un máximo de unas 5.700 entradas por carpeta. |
| Verificación | Comprueba también que el archivo esté en la carpeta que indica su CDC. |
| Respaldos | Se pueden hacer por mes: los meses cerrados ya no cambian. |
| Retención | Se pueden archivar o borrar carpetas `AAAA/` enteras cuando venza el plazo legal de conservación. |
| KUDE | Ninguno: la ruta completa sigue sin espacios. |

---

## 4. Diseño de la solución

### 4.1 Base de datos

- Nueva columna `facturacion.dte.cdc varchar(44)` con índice `UNIQUE`.
- En la fase 1, `cdc` acepta nulos y `xml` pasa a aceptar nulos.
- En la fase 4, `cdc` pasa a ser obligatoria y se elimina `xml`.

### 4.2 Configuración

Nueva variable de entorno:

```
#Carpeta de almacenamiento de XML de DTE (ruta absoluta, sin espacios)
DTE_XML_FOLDER=/var/lib/tvmax-erp/dte-xml
```

- Fuera del repositorio (no usar `tmp/`).
- **Sin espacios**: el jar del KUDE rechaza rutas con espacios
  (`kude-util.service.ts:87`).
- Si no está definida, la aplicación debe fallar al iniciar.

### 4.3 Servicio `DteXmlStorageService`

Ubicación: `src/modulos/sifen/sifen-utils/services/dte/dte-xml-storage.service.ts`
(se registra y exporta en `SifenUtilsModule`).

**Estado: implementado (2026-10-28).** La entidad `DTE` ya mapea `cdc`; la
propiedad `xml` se mantiene hasta adaptar los usos del código (sección 4.6).
Pruebas unitarias en `dte-xml-storage.service.spec.ts` (16 casos).

```ts
getRuta(cdc: string): string                 // ${DTE_XML_FOLDER}/AAAA/MM/CDC.xml
guardar(xml: string): Promise<string>        // escribe y devuelve el CDC
leer(dte: DTE): Promise<string>              // lee el XML de un DTE
```

Reglas de `guardar()`:

1. Obtiene el CDC con `DteXmlUtilsService.getCDC(xml)` y valida que tenga 44 dígitos.
2. Crea la carpeta `AAAA/MM` si no existe.
3. Escribe `CDC.xml.tmp` y luego hace `rename` a `CDC.xml` (escritura atómica).
4. Si el archivo ya existe con el **mismo** contenido, no hace nada.
5. Si existe con **otro** contenido, lanza un error. Nunca sobrescribe un
   documento firmado.

**Respaldo de lectura durante la transición** (se elimina en la fase 4): si el
archivo no existe, `leer()` lee `xml` de la base por `id`, escribe el archivo,
completa `cdc` si falta y deja un aviso en el log.

- Si `cdc` ya tenía un valor distinto del CDC del XML, lanza un error.
- `cdc` se completa con `UPDATE ... FOR UPDATE SKIP LOCKED`: si la fila está
  bloqueada por otra transacción (por ejemplo, la del propio llamador), no
  espera. Ese `cdc` queda para la próxima lectura o para el script de exportación.
- El archivo temporal tiene un nombre aleatorio (`{CDC}.xml.{uuid}.tmp`), así
  que dos escrituras simultáneas del mismo CDC no chocan.
- `onModuleInit()` valida `DTE_XML_FOLDER` con
  `DteXmlRutaUtil.validarCarpetaBase()`: si no es usable, la aplicación no inicia.

### 4.4 Entidad `DTE`

- Se quita la propiedad `xml` y se agrega `cdc`.
- Las consultas de DTE dejan de cargar unos 10 KB por fila.
- Los eventos de auditoría pasan a guardar el CDC en lugar del XML.

### 4.5 Consistencia entre disco y base de datos

El archivo se escribe dentro de `generarDTE()` / `regenerarDTE()`, **antes** de
confirmar la transacción:

| Caso | Resultado |
|---|---|
| Falla la escritura | Se lanza un error y la transacción se deshace. |
| Se escribe el archivo y luego falla la transacción | Queda un archivo huérfano. No causa problemas porque su CDC no se referencia; se puede limpiar con `--huerfanos`. |
| Fila sin archivo | No puede ocurrir. |

### 4.6 Cambios en el código

**Solo necesitan el CDC** (pasan a usar `dte.cdc`, sin leer archivos):

| Archivo | Uso actual |
|---|---|
| `sifen/sifen-utils/services/sifen/sifen-api-util.service.ts:200` | `consultarDTE` → `getCDC(factura.xml)` |
| `sifen/sifen-utils/services/lotes/lote-dte.service.ts:241` | resultado del lote → `getCDC(dte.xml)` |
| `sifen/sifen-utils/services/sifen/sifen-eventos-util.service.ts:31` | cancelación de factura → `getCDC(factura.xml)` |
| `sifen/sifen-utils/services/sifen/sifen-eventos-util.service.ts:43` | cancelación de nota de crédito → `getCDC(dte.xml)` |
| `sifen/sifen-utils/services/dte/nota-credito-electronica-utils.service.ts:99` | documento asociado → `getCDC(dteAsoc.xml)` |

**Escritura** (`dte.cdc = await storage.guardar(xml)`):

| Archivo |
|---|
| `sifen/sifen-utils/services/dte/factura-electronica-utils.service.ts:97` (`generarDTE`) |
| `sifen/sifen-utils/services/dte/factura-electronica-utils.service.ts:117` (`regenerarDTE`) |
| `sifen/sifen-utils/services/dte/nota-credito-electronica-utils.service.ts:119` (`generarDTE`) |

**Lectura**:

| Archivo | Cambio |
|---|---|
| `sifen/sifen-utils/services/sifen/sifen-api-util.service.ts:57` | `enviar` → `await storage.leer(dte)` |
| `sifen/sifen-utils/services/sifen/sifen-api-util.service.ts:130` | `enviarLote` → `Promise.all(detalles.map(d => storage.leer(d.dte)))` |
| `sifen/sifen-utils/services/kude/kude-util.service.ts:33` | pasar `storage.getRuta(cdc)` al jar y dejar de escribir el XML temporal en `tmp/` |
| `global/tasks/email-sender-task/email-sender-task.service.ts:141` | adjunto con `path: storage.getRuta(dte.cdc)` |
| `ventas/controller/ventas.controller.ts:143` | `await storage.leer(dte)` |
| `facturacion/notas-credito/services/find-dte-xml-by-notacredito.service.ts:20` | `await storage.leer(dte)` |

---

## 5. Fases de la transición

### Fase 0 — Preparación del servidor (manual)

- [ ] Crear `DTE_XML_FOLDER` con dueño el usuario de pm2 (carpetas `0750`, archivos `0640`).
- [ ] Agregar `DTE_XML_FOLDER` al `.env` de producción.
- [ ] Revisar el espacio libre: hoy hacen falta unos 805 MB, más unos 50 MB por mes.
- [ ] **Agregar la carpeta a la rutina de respaldos.** `pg_dump` ya no incluirá
      los XML, y son documentos tributarios que deben conservarse.

### Fase 1 — Migración de esquema (TypeORM; la corre el pipeline)

Archivo: `typeorm/migrations/1793222942375-dte-xml-a-archivos.ts` (implementado)

```sql
-- up
ALTER TABLE facturacion.dte ADD COLUMN cdc varchar(44);

UPDATE facturacion.dte
SET cdc = (xpath('/s:rDE/s:DE/@Id', xml,
          ARRAY[ARRAY['s','http://ekuatia.set.gov.py/sifen/xsd']]))[1]::text;

CREATE UNIQUE INDEX uq_dte_cdc ON facturacion.dte(cdc);

ALTER TABLE facturacion.dte ALTER COLUMN xml DROP NOT NULL;

COMMENT ON COLUMN facturacion.dte.cdc IS
  'Código de Control (CDC). El XML está en ${DTE_XML_FOLDER}/AAAA/MM/{cdc}.xml';
```

```sql
-- down: primero comprueba que no haya filas con xml NULL. Si las hay, se
-- detiene con un error que indica ejecutar antes el script con --restaurar.
ALTER TABLE facturacion.dte ALTER COLUMN xml SET NOT NULL;
DROP INDEX facturacion.uq_dte_cdc;
ALTER TABLE facturacion.dte DROP COLUMN cdc;
```

`cdc` acepta nulos **a propósito**: durante el build el código viejo sigue
creando DTE sin CDC. Si fuera obligatoria, la emisión de facturas fallaría en
ese tiempo.

### Fase 2 — Exportación de los XML existentes (script manual)

Archivo: `typeorm/scripts/exportar-xml-dte.ts`

Script en `package.json`:
`"dte:exportar-xml": "ts-node -r tsconfig-paths/register ./typeorm/scripts/exportar-xml-dte.ts"`

Usa la misma conexión de `typeorm/typeorm.config.ts`.

Carpeta de destino:

- El script **lee `DTE_XML_FOLDER` del mismo `.env` que usa la aplicación**.
  La aplicación lo carga desde la raíz del proyecto
  (`ConfigModule.forRoot({ envFilePath: join(__dirname, '..', '.env') })` en
  `src/app.module.ts`). El script lo carga con una ruta explícita
  (`config({ path: join(__dirname, '..', '..', '.env') })`), para no depender
  de la carpeta desde la que se ejecute. Ojo: `typeorm.config.ts` usa `config()`
  sin ruta, que lee el `.env` de la carpeta actual.
- La ruta de cada archivo se calcula con **la misma función** que usará
  `DteXmlStorageService.getRuta()`: `DteXmlRutaUtil.getRuta(carpetaBase, cdc)`
  en `src/modulos/sifen/sifen-utils/services/dte/dte-xml-ruta.util.ts`.
  `DteXmlRutaUtil.validarCarpetaBase()` hace las validaciones de la carpeta.
  Así el script y la aplicación no pueden calcular rutas distintas.
- Antes de procesar cualquier fila, el script se detiene con un error si
  `DTE_XML_FOLDER` no está definida, no es una ruta absoluta, contiene
  espacios, no existe o no se puede escribir en ella. No crea la carpeta base
  por su cuenta (eso se hace en la fase 0), solo las subcarpetas `AAAA/MM`.
- Al iniciar muestra la carpeta que va a usar. En `--dry-run` también la
  muestra, para revisarla antes de exportar.
- Debe ejecutarse con el mismo usuario de pm2, para que los archivos queden
  con el dueño y los permisos correctos.

Algoritmo:

1. Recorre la tabla en lotes de 500 por `id`
   (`WHERE id > :ultimo AND xml IS NOT NULL ORDER BY id LIMIT 500`).
2. Calcula el CDC con `xpath` en SQL; no depende de la columna `cdc`, así que
   puede correr **antes** de la fase 1.
3. Calcula la ruta `AAAA/MM/CDC.xml` y crea la carpeta si no existe.
4. Si el archivo existe y es idéntico, lo salta. Si no existe, lo escribe de
   forma atómica (`.tmp` + `rename`). Si existe con otro contenido, lo registra
   como error.
5. Vuelve a leer el archivo, compara su SHA-256 con el de la base y confirma que
   el `<DE Id>` del archivo sea igual al CDC.
6. Si la columna `cdc` existe y está en NULL, la completa.
7. Muestra un resumen (exportados, saltados, errores) y termina con un código de
   error si hubo fallos.

Modos:

| Modo | Qué hace |
|---|---|
| (por defecto) | Exporta lo que falta. Se puede repetir y retomar. |
| `--dry-run` | Muestra lo que haría, sin escribir. |
| `--verificar` | Compara todas las filas que tienen `xml` contra sus archivos (hash y ruta). |
| `--huerfanos` | Lista los archivos cuyo CDC no existe en `facturacion.dte`, los que están en una carpeta que no corresponde a su CDC, los temporales `.tmp` sin terminar y los archivos desconocidos. No borra nada. |
| `--restaurar` | Copia los archivos de vuelta a la columna `xml` de los DTE que no la tienen (para volver atrás). Admite `--dry-run`. |

Códigos de salida: `0` sin errores, `1` con errores en algún DTE, `2` opciones
o carpeta inválidas.

**Estado: implementado y probado en la base local (2026-10-28).**

| Prueba (84.416 DTE) | Resultado |
|---|---|
| `--dry-run` antes de la migración | 16,6 s, 84.416 a escribir, 0 errores, sin escribir archivos |
| Exportación antes de la migración | 26,8 s, 84.416 escritos, 0 errores, ~1 GB en disco, 18 carpetas, máx. 5.695 archivos por carpeta |
| Segunda ejecución | 84.416 ya existentes, 0 escritos |
| Archivo alterado / faltante | Alterado: error «contenido distinto», no se sobrescribe. Faltante: se vuelve a escribir |
| `--huerfanos` | Detecta el archivo mal ubicado, el CDC inválido y el `.tmp` |
| Migración `up` | 21 s en total |
| 3 filas con `cdc` NULL (DTE creados durante el deploy) | `--verificar` las marca y la exportación las completa |
| Fila con `xml` NULL | `--verificar` la valida desde el disco; el `down` se niega a revertir; `--restaurar` la devuelve idéntica (mismo SHA-256) |
| Migración `down` | Deja el esquema como estaba |

### Orden de ejecución en producción

| Paso | Momento | Acción |
|---|---|---|
| 1 | Antes del deploy, con la app en marcha | `npm run dte:exportar-xml`: exportación masiva, solo lee la base. |
| 2 | Deploy | Merge a `master`. El pipeline corre la migración de la fase 1, el build y el reinicio. |
| 3 | Inmediatamente después | `npm run dte:exportar-xml` otra vez: cubre los DTE creados entre el paso 1 y el reinicio, y completa su `cdc`. |
| 4 | Después | `npm run dte:exportar-xml -- --verificar` |

El respaldo de lectura del servicio (sección 4.3) cubre cualquier fila que se
escape entre los pasos.

### Fase 3 — Período de verificación (sugerido: 30 días)

- [ ] `--verificar` sin errores.
- [ ] `SELECT count(*) FROM facturacion.dte WHERE cdc IS NULL;` → 0
- [ ] Ningún aviso del respaldo de lectura en los logs de pm2.
- [ ] Probar en producción: descargar el XML (`/ventas/:id/dte` y la nota de
      crédito), generar el KUDE, enviar un email, enviar y consultar un lote,
      cancelar, emitir una nota de crédito y editar una venta (regeneración).
- [ ] Confirmar que el respaldo de la carpeta funciona (restaurar un archivo de prueba).

### Fase 4 — Limpieza (segunda migración TypeORM)

Archivo: `typeorm/migrations/<timestamp>-eliminar-columna-xml-dte.ts`

```sql
-- up
ALTER TABLE facturacion.dte ALTER COLUMN cdc SET NOT NULL;
ALTER TABLE facturacion.dte DROP COLUMN xml;
```

```sql
-- down (la estructura vuelve, los datos se recuperan con --restaurar)
ALTER TABLE facturacion.dte ADD COLUMN xml xml;
ALTER TABLE facturacion.dte ALTER COLUMN cdc DROP NOT NULL;
```

- Quitar el respaldo de lectura de `DteXmlStorageService`.
- Correr **a mano**, en horario de poco uso: `VACUUM FULL facturacion.dte;`
  (bloquea la tabla y no puede ir dentro de una migración, porque TypeORM las
  ejecuta en una transacción). Recupera unos 670 MB.

### Fase 5 — Opcional: limpieza de la auditoría (31 GB)

**Decisión pendiente: se trata de datos de auditoría.**

1. Antes, exportar las versiones **anteriores** del XML que solo existen en la
   auditoría (DTE regenerados: `estado_anterior.xml` con un CDC distinto al
   actual) a archivos, usando su CDC.
2. Quitar la clave `xml`, por lotes de id:
   ```sql
   UPDATE public.evento_auditoria
   SET estado_anterior = (estado_anterior::jsonb - 'xml')::json,
       estado_nuevo    = (estado_nuevo::jsonb    - 'xml')::json
   WHERE idtabla = 38 AND id BETWEEN :desde AND :hasta;
   ```
   La columna es `json`; pasar por `jsonb` cambia el orden de las claves y el formato.
3. Recuperar el espacio con `pg_repack` (sin bloquear la tabla) o `VACUUM FULL`
   (la bloquea y necesita espacio libre igual al tamaño final de la tabla).

---

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Se pierden archivos (disco, borrado accidental) | Respaldos de la carpeta (fase 0); mantener la columna `xml` hasta la fase 4. |
| Un DTE queda sin archivo | Se escribe antes de confirmar la transacción; respaldo de lectura; `--verificar`. |
| Se sobrescribe un XML firmado | `guardar()` rechaza contenido distinto para el mismo CDC. |
| Lectura de un archivo a medio escribir | Escritura atómica (`.tmp` + `rename` en la misma carpeta). |
| Firma digital alterada | Se escribe exactamente `xml::text`, igual a lo que hoy entrega `/ventas/:id/dte`; la firma cubre el nodo `DE`. |
| Ruta con espacios (KUDE) | Validar `DTE_XML_FOLDER` al iniciar. |
| Más de un servidor en el futuro | Hoy hay un solo host con pm2. El servicio aísla el almacenamiento para poder pasar a NFS o S3. |
| DTE creados durante el deploy | `cdc` acepta nulos en la fase 1, se repite el script y está el respaldo de lectura. |

---

## 7. Fuera de alcance

- `facturacion.dte_cancelacion.xml` (62 filas, 277 kB). Son eventos de
  cancelación y no tienen `<DE Id>`. Podrían seguir el mismo patrón más adelante.
- Cambiar el envío de emails para que no genere un evento de auditoría por cada intento.

---

## 8. Decisiones pendientes

1. Ruta de `DTE_XML_FOLDER` en producción (propuesta: `/var/lib/tvmax-erp/dte-xml`).
2. Incluir el respaldo de lectura durante la transición (recomendado: sí).
3. Duración del período de verificación antes de la fase 4 (propuesta: 30 días).
4. Hacer o no la fase 5 (limpieza de la auditoría), y exportar antes las
   versiones anteriores del XML.
