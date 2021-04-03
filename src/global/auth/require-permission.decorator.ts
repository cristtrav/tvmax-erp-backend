import { SetMetadata } from '@nestjs/common'

export const RequirePermission = (funcionalidad: number) => SetMetadata('funcionalidad', funcionalidad)