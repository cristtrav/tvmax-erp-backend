import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { TipoDomicilio } from '../../dto/tipodomicilio.dto';
import { Util } from '../../util/util';
import { IWhereParam } from '@util/iwhereparam.interface';

@Injectable()
export class TiposdomiciliosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<TipoDomicilio[]>{
        const { eliminado, sort, offset, limit } = queryParams;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado});
        var query: string = `SELECT * FROM public.tipo_domicilio ${wp.whereStr} ${Util.buildSortOffsetLimitStr(sort, offset, limit)}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number>{
        const { eliminado } = queryParams;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado});
        var query: string = `SELECT COUNT(*) FROM public.tipo_domicilio ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async create(td: TipoDomicilio){
        const query: string = `INSERT INTO public.tipo_domicilio(id, descripcion, eliminado)
        VALUES($1, $2, false)`;
        await this.dbsrv.execute(query, [td.id, td.descripcion]);
    }

    async edit(oldId: number, td: TipoDomicilio): Promise<boolean>{
        const query: string = `UPDATE public.tipo_domicilio SET id = $1, descripcion = $2 WHERE id = $3`;
        return (await this.dbsrv.execute(query, [td.id, td.descripcion, oldId])).rowCount > 0;
    }

    async findById(id: number): Promise<TipoDomicilio | null>{
        const query: string = `SELECT * FROM public.tipo_domicilio WHERE id = $1`;
        const rows: TipoDomicilio[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length === 0) return null;
        return rows[0];
    }

    async delete(id: number): Promise<boolean> {
        const query: string = `UPDATE public.tipo_domicilio SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

    async getLastId(): Promise<number>{
        const query: string = `SELECT MAX(id) FROM public.tipo_domicilio`;
        return (await this.dbsrv.execute(query)).rows[0].count;
    }

}
