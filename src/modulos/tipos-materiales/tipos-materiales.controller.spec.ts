import { Test, TestingModule } from '@nestjs/testing';
import { TiposMaterialesController } from './tipos-materiales.controller';

describe('TiposMaterialesController', () => {
  let controller: TiposMaterialesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposMaterialesController],
    }).compile();

    controller = module.get<TiposMaterialesController>(TiposMaterialesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
