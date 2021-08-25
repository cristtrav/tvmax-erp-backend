import { Test, TestingModule } from '@nestjs/testing';
import { TiposdomiciliosService } from './tiposdomicilios.service';

describe('TiposdomiciliosService', () => {
  let service: TiposdomiciliosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiposdomiciliosService],
    }).compile();

    service = module.get<TiposdomiciliosService>(TiposdomiciliosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
