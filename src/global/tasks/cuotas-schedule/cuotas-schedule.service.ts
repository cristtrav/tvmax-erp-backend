import { CuotasService } from '@modulos/cuotas/service/cuotas.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CuotasScheduleService {

    constructor(
        private cuotasService: CuotasService,
    ) { }

    @Cron('0 6 1 * *')
    async generarCuotasSuscripcionesActivas() {
        let fechaHoraActual = new Date();
        await this.cuotasService.generarCuotas(fechaHoraActual.getMonth() + 1, fechaHoraActual.getFullYear());
    }
}
