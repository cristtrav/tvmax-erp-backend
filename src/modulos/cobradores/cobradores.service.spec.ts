import { Test, TestingModule } from '@nestjs/testing';
import { CobradoresService } from './cobradores.service';

describe('CobradoresService', () => {
  let service: CobradoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CobradoresService],
    }).compile();

    service = module.get<CobradoresService>(CobradoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
