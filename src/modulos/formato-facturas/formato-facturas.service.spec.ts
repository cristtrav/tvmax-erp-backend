import { Test, TestingModule } from '@nestjs/testing';
import { FormatoFacturasService } from './formato-facturas.service';

describe('FormatoFacturasService', () => {
  let service: FormatoFacturasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormatoFacturasService],
    }).compile();

    service = module.get<FormatoFacturasService>(FormatoFacturasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
