import { Test, TestingModule } from '@nestjs/testing';
import { FormatoFacturasController } from './formato-facturas.controller';

describe('FormatoFacturasController', () => {
  let controller: FormatoFacturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormatoFacturasController],
    }).compile();

    controller = module.get<FormatoFacturasController>(FormatoFacturasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
