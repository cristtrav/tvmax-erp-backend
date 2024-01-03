import { Cliente } from '@database/entity/cliente.entity';
import { Participante } from '@database/entity/sorteos/participante.entity';
import { Sorteo } from '@database/entity/sorteos/sorteo.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { ParticipanteView } from '@database/view/sorteos/participante.view';
import { SorteoView } from '@database/view/sorteos/sorteo.view';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class SorteosService {

    constructor(
        @InjectRepository(Sorteo)
        private sorteoRepo: Repository<Sorteo>,
        @InjectRepository(SorteoView)
        private sorteoViewRepo: Repository<SorteoView>,
        @InjectRepository(Suscripcion)
        private suscripcionRepo: Repository<Suscripcion>,
        @InjectRepository(Cliente)
        private clienteRepo: Repository<Cliente>,
        @InjectRepository(ParticipanteView)
        private participanteViewRepo: Repository<ParticipanteView>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<SorteoView>{
        const { eliminado, sort, offset, limit } = queries;
        const alias = 'sorteo';
        let query = this.sorteoViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    getSelectQueryParticipantes(queries: QueriesType): SelectQueryBuilder<ParticipanteView>{
        const alias = 'participante';
        const { idsorteo, sort, offset, limit, search } = queries;
        let query = this.participanteViewRepo.createQueryBuilder(alias);
        if(idsorteo) query = query.andWhere(`${alias}.idsorteo = :idsorteo`, {idsorteo});
        if(search) query = query.andWhere(new Brackets(qb => {
            if(!Number.isNaN(Number(search))) qb = qb.orWhere(`${alias}.idcliente = :searchidcli`, {searchidcli: Number(search)});
            qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :searchcli`, {searchcli: `%${search.toLowerCase()}%`});
        }))
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    findAll(queries: QueriesType): Promise<SorteoView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    findById(id: number): Promise<Sorteo>{
        return this.sorteoRepo.findOneByOrFail({id});
    }

    async create(sorteo: Sorteo, idusuario: number){
        const oldSorteo = await this.sorteoRepo.findOneBy({id: sorteo.id});
        if(oldSorteo && !oldSorteo.eliminado) throw new HttpException({
            message: `El sorteo con código «${sorteo.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST)

        await this.datasource.transaction(async manager => {
            await manager.save(sorteo);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaSorteos(idusuario, 'R', oldSorteo, sorteo));
        });
    }

    async update(oldId: number, sorteo: Sorteo, idusuario: number){
        const oldSorteo = await this.sorteoRepo.findOneByOrFail({id: oldId});

        if(oldId != sorteo.id && await this.sorteoRepo.findOneBy({id: sorteo.id})) throw new HttpException({
            message: `El código de sorteo «${sorteo.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(EventoAuditoriaUtil.getEventoAuditoria(TablasAuditoriaList.SORTEOS.id, idusuario, 'M', oldSorteo, sorteo));
            await manager.save(oldSorteo);
            await manager.save(sorteo);
        });
    }

    async delete(id: number, idusuario: number){
        const sorteo = await this.sorteoRepo.findOneByOrFail({id});
        const oldSorteo = {...sorteo};
        sorteo.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(EventoAuditoriaUtil.getEventoAuditoria(TablasAuditoriaList.SORTEOS.id, idusuario, 'E', oldSorteo, sorteo));
            await manager.save(sorteo);
        });
    }

    async getLastId(): Promise<number>{
        return (await this.sorteoRepo
            .createQueryBuilder('sorteo')
            .select('MAX(sorteo.id)', 'max')
            .getRawOne()
        ).max;
    }

    async agregarParticipantes(criterios: CriteriosSorteoType, idsorteo: number){
        const als = 'suscripcion';
        const suscripciones: Suscripcion[] = await this.suscripcionRepo.createQueryBuilder(als)
        .andWhere(`${als}.eliminado = FALSE`)
        .andWhere(`${als}.gentileza = FALSE`)
        .andWhere(`${als}.fechaSuscripcion <= :shasta`, { shasta: new Date(criterios.suscritoshasta)})
        .andWhere(new Brackets(qb => {
            qb = qb.orWhere(`${als}.estado = 'C'`);
            qb = qb.orWhere(`${als}.estado = 'R'`);
        }))
        .leftJoinAndSelect(
            `${als}.cuotas`,
            'cuota',
            `cuota.eliminado = FALSE AND cuota.pagado = FALSE AND cuota.fechaVencimiento <= :aldiahasta`,
            { aldiahasta: new Date(criterios.aldiahasta) }
        )
        .leftJoinAndSelect(
            `${als}.cliente`,
            'cliente'
        )
        .orderBy(`${als}.idcliente`, 'ASC')
        .getMany();

        /*
        Se obtienen las suscripciones con cantidad de cuotas 0 (Cero cuotas pendientes)
        y sin clientes excluidos
        */
        const suscripcionesSinPend: Suscripcion[] = suscripciones.filter(sus => sus.cuotas.length == 0 && !sus.cliente.excluidoSorteo);
        //Se crea un Set con los ID de clientes sin duplicar
        const setIdClientes = new Set<number>(suscripcionesSinPend.map(s => s.idcliente));
        /*
        Se crea un Map relacionando ID del cliente
        con la cantidad de suscripciones sin cuotas pendientes encontradas
        */
        const mapCantSuscSinCuoPend = new Map<number, number>(
            Array.from(setIdClientes, (idcli) => [
                idcli,
                suscripcionesSinPend.reduce((cant, s) => s.idcliente == idcli ? cant + 1 : cant, 0)
            ])
        );
        const clientesConSuscActivas = await this.clienteRepo.createQueryBuilder('cliente')
        .where(`cliente.id IN (:...idclientes)`, {idclientes: Array.from(setIdClientes.values())})
        .leftJoinAndSelect(
            'cliente.suscripciones',
            'suscripcion',
            `suscripcion.eliminado = FALSE AND (suscripcion.estado = 'C' OR suscripcion.estado = 'R')`
        )
        .getMany();

        const idClientesParticipantes = Array.from(setIdClientes)
        .filter(idcliente =>
            mapCantSuscSinCuoPend.get(idcliente) == clientesConSuscActivas.find(c => c.id == idcliente)?.suscripciones.length
        );

        await this.datasource.transaction(async manager => {
            for(let idcliente of idClientesParticipantes){
                const participante = new Participante();
                participante.idcliente = idcliente;
                participante.idsorteo = idsorteo;
                if(!await manager.exists(Participante, {where: {idcliente, idsorteo}}))
                await manager.save(participante);
            }
        })
    }

    findAllParticipantesBySorteo(idsorteo: number, queries: QueriesType): Promise<ParticipanteView[]>{
        return this.getSelectQueryParticipantes({idsorteo, ...queries}).getMany();
    }

    countParticipantesBySorteo(idsorteo: number, queries: QueriesType): Promise<number>{
        return this.getSelectQueryParticipantes({idsorteo, ...queries}).getCount();
    }
    
    async deleteParticipante(idcliente: number, idsorteo: number){
        const participante = new Participante();
        participante.idcliente = idcliente;
        participante.idsorteo = idsorteo;
        await this.datasource.transaction(async manager => {
            await manager.remove(participante);
        });
    }
}

type QueriesType = {[name: string]: any};
type CriteriosSorteoType = {
    suscritoshasta: string;
    aldiahasta: string;
}
