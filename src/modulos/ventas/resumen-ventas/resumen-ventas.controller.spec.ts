import { Test, TestingModule } from '@nestjs/testing';
import { ResumenVentasController } from './resumen-ventas.controller';

describe('ResumenVentasController', () => {
  let controller: ResumenVentasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumenVentasController],
    }).compile();

    controller = module.get<ResumenVentasController>(ResumenVentasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
