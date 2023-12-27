import { Test, TestingModule } from '@nestjs/testing';
import { SorteosService } from './sorteos.service';

describe('SorteosService', () => {
  let service: SorteosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SorteosService],
    }).compile();

    service = module.get<SorteosService>(SorteosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
