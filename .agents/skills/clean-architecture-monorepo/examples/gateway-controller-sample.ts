import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CreateAccountUseCase } from './use-case-sample';
import { AccountNature } from './account-entity-sample';

export class CreateAccountRequestDto {
  code!: string;
  name!: string;
  nature?: AccountNature;
}

/**
 * CONTROLADOR CENTRALIZADO EN EL API GATEWAY
 * Actúa como punto de distribución HTTP. Valida la petición y despacha
 * a los Casos de Uso específicos de la aplicación.
 */
@Controller('api/v1/accounts')
export class AccountsGatewayController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    // Se inyectan otros casos de uso a medida que se desarrollen:
    // private readonly deleteAccountUseCase: DeleteAccountUseCase,
    // private readonly getAccountTreeUseCase: GetAccountTreeUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(@Body() dto: CreateAccountRequestDto) {
    const account = await this.createAccountUseCase.execute({
      code: dto.code,
      name: dto.name,
      nature: dto.nature,
    });

    return {
      code: account.code,
      name: account.name,
      nature: account.nature,
      level: account.level,
      acceptsMovements: account.acceptsMovements(),
      parentCode: account.getExpectedParentCode(),
    };
  }
}

