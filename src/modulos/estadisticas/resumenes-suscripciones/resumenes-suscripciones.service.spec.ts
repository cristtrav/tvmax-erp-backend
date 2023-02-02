import { Test, TestingModule } from '@nestjs/testing';
import { ResumenesSuscripcionesService } from './resumenes-suscripciones.service';

describe('ResumenesSuscripcionesService', () => {
  let service: ResumenesSuscripcionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResumenesSuscripcionesService],
    }).compile();

    service = module.get<ResumenesSuscripcionesService>(ResumenesSuscripcionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
