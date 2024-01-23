import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosDepositosService } from './usuarios-depositos.service';

describe('UsuariosDepositosService', () => {
  let service: UsuariosDepositosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosDepositosService],
    }).compile();

    service = module.get<UsuariosDepositosService>(UsuariosDepositosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
