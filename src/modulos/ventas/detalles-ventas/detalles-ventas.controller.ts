import { Controller, UseGuards } from '@nestjs/common';
import { LoginGuard } from '@auth/guards/login.guard';

@Controller('ventas/detalles')
@UseGuards(LoginGuard)
export class DetallesVentasController {

    constructor() { }

}
