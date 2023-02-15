import { Test, TestingModule } from '@nestjs/testing';
import { ResumenesVentasController } from './resumenes-ventas.controller';

describe('ResumenesVentasController', () => {
  let controller: ResumenesVentasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumenesVentasController],
    }).compile();

    controller = module.get<ResumenesVentasController>(ResumenesVentasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
