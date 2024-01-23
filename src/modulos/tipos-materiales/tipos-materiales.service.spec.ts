import { Test, TestingModule } from '@nestjs/testing';
import { TiposMaterialesService } from './tipos-materiales.service';

describe('TiposMaterialesService', () => {
  let service: TiposMaterialesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiposMaterialesService],
    }).compile();

    service = module.get<TiposMaterialesService>(TiposMaterialesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
