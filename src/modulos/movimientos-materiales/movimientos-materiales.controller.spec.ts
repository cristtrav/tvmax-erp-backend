import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosMaterialesController } from './movimientos-materiales.controller';

describe('MovimientosMaterialesController', () => {
  let controller: MovimientosMaterialesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientosMaterialesController],
    }).compile();

    controller = module.get<MovimientosMaterialesController>(MovimientosMaterialesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
