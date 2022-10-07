import { Test, TestingModule } from '@nestjs/testing';
import { DetallesVentasController } from './detalles-ventas.controller';

describe('DetallesVentasController', () => {
  let controller: DetallesVentasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallesVentasController],
    }).compile();

    controller = module.get<DetallesVentasController>(DetallesVentasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
