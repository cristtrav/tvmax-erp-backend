import { Test, TestingModule } from '@nestjs/testing';
import { DetallesReclamosService } from './detalles-reclamos.service';

describe('DetallesReclamosService', () => {
  let service: DetallesReclamosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetallesReclamosService],
    }).compile();

    service = module.get<DetallesReclamosService>(DetallesReclamosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
