import { Test, TestingModule } from '@nestjs/testing';
import { DetallesMovimientosMaterialesController } from './detalles-movimientos-materiales.controller';

describe('DetallesMovimientosMaterialesController', () => {
  let controller: DetallesMovimientosMaterialesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallesMovimientosMaterialesController],
    }).compile();

    controller = module.get<DetallesMovimientosMaterialesController>(DetallesMovimientosMaterialesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
