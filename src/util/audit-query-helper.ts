import { TablaAuditoria } from "@dto/tabla-auditoria.dto";

export class AuditQueryHelper {

    public static async auditPostInsert(dbcli, tabla: TablaAuditoria, idusuario: number, id: number | string) {
        const queryAudit: string = `INSERT INTO public.evento_auditoria(id, fecha_hora, idusuario, idtabla, operacion, estado_nuevo)
            VALUES(nextval('evento_auditoria_seq'), NOW(), $1, $2, 'R', (SELECT row_to_json(${tabla.nombre}) FROM public.${tabla.nombre} WHERE id = $3))`;
        const paramsAudit = [idusuario, tabla.id, id];
        await dbcli.query(queryAudit, paramsAudit);
    }

    public static async auditPreUpdate(dbcli, tabla: TablaAuditoria, idusuario: number, oldid: number | string): Promise<number> {
        const queryAudit: string = `INSERT INTO public.evento_auditoria(id, fecha_hora, idusuario, idtabla, operacion, estado_anterior)
            VALUES(nextval('evento_auditoria_seq'), NOW(), $1, $2, 'M', (SELECT row_to_json(${tabla.nombre}) FROM public.${tabla.nombre} WHERE id = $3)) RETURNING *`;
        const paramsAutitI = [idusuario, tabla.id, oldid];
        const idevento: number = (await dbcli.query(queryAudit, paramsAutitI)).rows[0].id;
        return idevento;
    }

    public static async auditPostUpdate(dbcli, tabla: TablaAuditoria, idevento: number, newid: number | string){
        const queryAuditU: string = `UPDATE public.evento_auditoria SET estado_nuevo = (SELECT row_to_json(${tabla.nombre}) FROM public.${tabla.nombre} WHERE id = $1) WHERE id = $2`;
        const paramsAuditU = [newid, idevento];
        await dbcli.query(queryAuditU, paramsAuditU);
    }

    public static async auditPostDelete(dbcli, tabla: TablaAuditoria, idusuario: number, id: number | string){
        const queryAuditI: string = `INSERT INTO public.evento_auditoria(id, fecha_hora, idusuario, idtabla, operacion, estado_anterior)
            VALUES(nextval('evento_auditoria_id_seq'), NOW(), $1, $2, 'E', (SELECT row_to_json(${tabla.nombre}) FROM public.${tabla.nombre} WHERE id = $3)) RETURNING *`;
        const paramsAutitI = [idusuario, tabla.id, id];
        await dbcli.query(queryAuditI, paramsAutitI);
    }

}