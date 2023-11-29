import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosMaterialesService } from './movimientos-materiales.service';

describe('MovimientosMaterialesService', () => {
  let service: MovimientosMaterialesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovimientosMaterialesService],
    }).compile();

    service = module.get<MovimientosMaterialesService>(MovimientosMaterialesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
