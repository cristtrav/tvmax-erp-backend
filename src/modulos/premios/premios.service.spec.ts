import { Test, TestingModule } from '@nestjs/testing';
import { PremiosService } from './premios.service';

describe('PremiosService', () => {
  let service: PremiosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PremiosService],
    }).compile();

    service = module.get<PremiosService>(PremiosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
