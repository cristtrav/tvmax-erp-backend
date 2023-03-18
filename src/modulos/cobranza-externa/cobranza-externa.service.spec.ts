import { Test, TestingModule } from '@nestjs/testing';
import { CobranzaExternaService } from './cobranza-externa.service';

describe('CobranzaExternaService', () => {
  let service: CobranzaExternaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CobranzaExternaService],
    }).compile();

    service = module.get<CobranzaExternaService>(CobranzaExternaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
