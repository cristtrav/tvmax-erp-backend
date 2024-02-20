import { Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { DetalleReclamoDTO } from '@dto/reclamos/detalle-reclamo.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReclamosService {

    constructor(){}

    async create(reclamo: Reclamo, detalles: DetalleReclamoDTO[], idusuario: number){
        console.log(reclamo, detalles, idusuario);
    }
}
