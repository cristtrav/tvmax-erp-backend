import { Test, TestingModule } from '@nestjs/testing';
import { DetallesMovimientosMaterialesService } from './detalles-movimientos-materiales.service';

describe('DetallesMovimientosMaterialesService', () => {
  let service: DetallesMovimientosMaterialesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetallesMovimientosMaterialesService],
    }).compile();

    service = module.get<DetallesMovimientosMaterialesService>(DetallesMovimientosMaterialesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
