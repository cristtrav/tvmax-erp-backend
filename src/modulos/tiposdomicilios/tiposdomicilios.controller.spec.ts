import { Test, TestingModule } from '@nestjs/testing';
import { TiposdomiciliosController } from './tiposdomicilios.controller';

describe('TiposdomiciliosController', () => {
  let controller: TiposdomiciliosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposdomiciliosController],
    }).compile();

    controller = module.get<TiposdomiciliosController>(TiposdomiciliosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
