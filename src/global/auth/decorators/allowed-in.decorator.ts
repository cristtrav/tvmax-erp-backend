import { SetMetadata } from "@nestjs/common";

export const AllowedIn = (...idfuncionalidades: number[]) => SetMetadata("idfuncionalidades", idfuncionalidades)