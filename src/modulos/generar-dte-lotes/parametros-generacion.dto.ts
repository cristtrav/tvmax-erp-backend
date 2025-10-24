import { IsBoolean, IsDateString, IsInt } from "class-validator";

export class ParametrosGeneracionDTO {
    @IsDateString()
    desde: string;

    @IsDateString()
    hasta: string;

    @IsInt()
    idestadodte: number;

    @IsBoolean()
    pagado: boolean;

    @IsBoolean()
    anulado: boolean;
}