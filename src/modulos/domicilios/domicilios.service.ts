import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { Domicilio } from '@dto/domicilio.dto';
import { Util } from '@util/util';
import { IWhereParam } from '@util/iwhereparam.interface';

@Injectable()
export class DomiciliosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<Domicilio[]>{
        const { eliminado, idcliente, sort, offset, limit } = queryParams;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado, idcliente});
        const sofStr: string = Util.buildSortOffsetLimitStr(sort, offset, limit);
        const query: string = `SELECT * FROM public.vw_domicilios ${wp.whereStr} ${sofStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number>{
        const { eliminado, idcliente } = queryParams;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado, idcliente});
        const query: string = `SELECT COUNT(*) FROM public.vw_domicilios ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async getLastId(): Promise<number>{
        const query: string = `SELECT MAX(id) FROM public.domicilio`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

    async create(d: Domicilio){
        if(d.principal === true){
            const queryPrincipal: string = `UPDATE public.domicilio SET principal = false WHERE idcliente = $1`;
            await this.dbsrv.execute(queryPrincipal, [d.idcliente]);
        }
        const query: string = `INSERT INTO public.domicilio(id, direccion, nro_medidor, idbarrio, observacion, idtipo_domicilio, idcliente, principal, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, false)`;
        const params: any[] = [d.id, d.direccion, d.nromedidor, d.idbarrio, d.observacion, d.idtipodomicilio, d.idcliente, d.principal];
        await this.dbsrv.execute(query, params);
    }

    async edit(oldId: number, d: Domicilio): Promise<boolean>{
        if(d.principal === true){
            const queryPrincipal: string = `UPDATE public.domicilio SET principal = false WHERE idcliente = $1`;
            await this.dbsrv.execute(queryPrincipal, [d.idcliente]);
        }
        const query: string = `UPDATE public.domicilio SET id = $1, direccion = $2, nro_medidor = $3, idbarrio = $4, observacion = $5, idtipo_domicilio = $6, idcliente = $7, principal = $8 WHERE id = $9`;
        const params: any[] = [d.id, d.direccion, d.nromedidor, d.idbarrio, d.observacion, d.idtipodomicilio, d.idcliente, d.principal, oldId];
        return (await this.dbsrv.execute(query, params)).rowCount > 0;
    }

    async findById(id: number): Promise<Domicilio | null> {
        const query: string = `SELECT * FROM public.vw_domicilios WHERE id = $1`;
        const rows: Domicilio[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length === 0) return null;
        return rows[0];
    }

    async delete(id: number): Promise<boolean> {
        const query: string = `UPDATE public.domicilio SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

}
