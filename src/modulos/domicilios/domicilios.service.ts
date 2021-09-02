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
}
