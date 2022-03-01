import { Test, TestingModule } from '@nestjs/testing';
import { ResumenVentasService } from './resumen-ventas.service';

describe('ResumenVentasService', () => {
  let service: ResumenVentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResumenVentasService],
    }).compile();

    service = module.get<ResumenVentasService>(ResumenVentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
