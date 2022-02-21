export class AuditQueryHelper {

    public static async auditPostInsert(dbcli, idtabla, idusuario, id) {
        const queryAudit: string = `INSERT INTO public.evento_auditoria(id, fecha_hora, idusuario, idtabla, operacion, estado_nuevo)
            VALUES(nextval('evento_auditoria_seq'), NOW(), $1, $2, 'R', (SELECT row_to_json(${this.getTableName(idtabla)}) FROM public.${this.getTableName(idtabla)} WHERE id = $3))`;
        const paramsAudit = [idusuario, idtabla, id];
        await dbcli.query(queryAudit, paramsAudit);
    }

    public static async auditPreUpdate(dbcli, idtabla, idusuario, oldid): Promise<number> {
        const queryAudit: string = `INSERT INTO public.evento_auditoria(id, fecha_hora, idusuario, idtabla, operacion, estado_anterior)
            VALUES(nextval('evento_auditoria_seq'), NOW(), $1, $2, 'M', (SELECT row_to_json(${this.getTableName(idtabla)}) FROM public.${this.getTableName(idtabla)} WHERE id = $3)) RETURNING *`;
        const paramsAutitI = [idusuario, idtabla, oldid];
        const idevento: number = (await dbcli.query(queryAudit, paramsAutitI)).rows[0].id;
        return idevento;
    }

    public static async auditPostUpdate(dbcli, idtabla, idevento, newid){
        const queryAuditU: string = `UPDATE public.evento_auditoria SET estado_nuevo = (SELECT row_to_json(${this.getTableName(idtabla)}) FROM public.${this.getTableName(idtabla)} WHERE id = $1) WHERE id = $2`;
        const paramsAuditU = [newid, idevento];
        await dbcli.query(queryAuditU, paramsAuditU);
    }

    public static async auditPostDelete(dbcli, idtabla, idusuario, id){
        const queryAuditI: string = `INSERT INTO public.evento_auditoria(id, fecha_hora, idusuario, idtabla, operacion, estado_anterior)
            VALUES(nextval('evento_auditoria_seq'), NOW(), $1, $2, 'E', (SELECT row_to_json(${this.getTableName(idtabla)}) FROM public.${this.getTableName(idtabla)} WHERE id = $3)) RETURNING *`;
        const paramsAutitI = [idusuario, idtabla, id];
        await dbcli.query(queryAuditI, paramsAutitI);
    }

    private static getTableName(idtable: number): string {
        switch (idtable) {
            case 1: return 'grupo';
            case 2: return 'servicio';
            case 3: return 'departamento';
            default: return '';
        }
    }

}