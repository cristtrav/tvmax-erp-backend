import { Test, TestingModule } from '@nestjs/testing';
import { ResumenesSuscripcionesController } from './resumenes-suscripciones.controller';

describe('ResumenesSuscripcionesController', () => {
  let controller: ResumenesSuscripcionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumenesSuscripcionesController],
    }).compile();

    controller = module.get<ResumenesSuscripcionesController>(ResumenesSuscripcionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
