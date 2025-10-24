import { Test, TestingModule } from '@nestjs/testing';
import { GenerarDteLotesService } from './generar-dte-lotes.service';

describe('GenerarDteLotesService', () => {
  let service: GenerarDteLotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerarDteLotesService],
    }).compile();

    service = module.get<GenerarDteLotesService>(GenerarDteLotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
