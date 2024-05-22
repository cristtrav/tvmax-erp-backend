import { Test, TestingModule } from '@nestjs/testing';
import { EventosCambiosEstadosService } from './eventos-cambios-estados.service';

describe('EventosCambiosEstadosService', () => {
  let service: EventosCambiosEstadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventosCambiosEstadosService],
    }).compile();

    service = module.get<EventosCambiosEstadosService>(EventosCambiosEstadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
