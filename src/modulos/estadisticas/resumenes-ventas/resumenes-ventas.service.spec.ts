import { Test, TestingModule } from '@nestjs/testing';
import { ResumenesVentasService } from './resumenes-ventas.service';

describe('ResumenesVentasService', () => {
  let service: ResumenesVentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResumenesVentasService],
    }).compile();

    service = module.get<ResumenesVentasService>(ResumenesVentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
