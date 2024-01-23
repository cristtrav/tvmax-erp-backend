import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosDepositosController } from './usuarios-depositos.controller';

describe('UsuariosDepositosController', () => {
  let controller: UsuariosDepositosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosDepositosController],
    }).compile();

    controller = module.get<UsuariosDepositosController>(UsuariosDepositosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
