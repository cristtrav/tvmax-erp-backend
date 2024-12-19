export class ServicioDTO{
    id: number;
    descripcion: string;
    idgrupo: number;
    grupo: string;
    precio: number = 0;
    suscribible: boolean = false;
    porcentajeiva: number = 10;
    facturarsinsuscripcion: boolean = false; 
}