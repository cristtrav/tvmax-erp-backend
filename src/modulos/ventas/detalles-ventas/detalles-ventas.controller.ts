import { AuthGuard } from '@auth/auth.guard';
import { Controller, UseGuards } from '@nestjs/common';
import { DetallesVentasService } from './detalles-ventas.service';

@Controller('ventas/detalles')
@UseGuards(AuthGuard)
export class DetallesVentasController {

    constructor() { }

}
