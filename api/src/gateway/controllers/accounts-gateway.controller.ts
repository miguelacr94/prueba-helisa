import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateAccountRequestDto } from '../dtos/create-account-request.dto.js';
import { RenameAccountRequestDto } from '../dtos/rename-account-request.dto.js';
import { CreateAccountUseCase } from '../../modules/accounts/application/use-cases/create-account.use-case.js';
import { FindAllAccountsUseCase } from '../../modules/accounts/application/use-cases/find-all-accounts.use-case.js';
import { FindAccountByCodeUseCase } from '../../modules/accounts/application/use-cases/find-account-by-code.use-case.js';
import { GetAccountTreeUseCase } from '../../modules/accounts/application/use-cases/get-account-tree.use-case.js';
import { DeleteAccountUseCase } from '../../modules/accounts/application/use-cases/delete-account.use-case.js';
import { RenameAccountUseCase } from '../../modules/accounts/application/use-cases/rename-account.use-case.js';

@ApiTags('Cuentas Contables (PUC)')
@Controller('accounts')
export class AccountsGatewayController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly findAllAccountsUseCase: FindAllAccountsUseCase,
    private readonly findAccountByCodeUseCase: FindAccountByCodeUseCase,
    private readonly getAccountTreeUseCase: GetAccountTreeUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly renameAccountUseCase: RenameAccountUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una cuenta contable',
    description:
      'Crea una cuenta en el catálogo. Valida longitud numérica (1: Clase, 2: Grupo, 4: Cuenta, 6: Subcuenta), unicidad del código y existencia de la cuenta padre. Las cuentas hijas heredan la naturaleza de su clase/padre.',
  })
  @ApiResponse({ status: 201, description: 'Cuenta creada satisfactoriamente.' })
  @ApiResponse({ status: 400, description: 'Código inválido o datos de entrada incorrectos.' })
  @ApiConflictResponse({ description: 'El código de cuenta ya existe en el catálogo.' })
  @ApiUnprocessableEntityResponse({ description: 'La cuenta padre no existe en el catálogo.' })
  async createAccount(@Body() dto: CreateAccountRequestDto) {
    return this.createAccountUseCase.execute({
      code: dto.code,
      name: dto.name,
      nature: dto.nature,
    });
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Consultar catálogo como un árbol anidado',
    description:
      'Retorna la jerarquía completa del catálogo de cuentas organizado como árbol (las Clases en el nivel superior y sus descendientes anidados recursivamente en "children").',
  })
  @ApiResponse({ status: 200, description: 'Estructura en árbol del catálogo contable.' })
  async getTree() {
    return this.getAccountTreeUseCase.execute();
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las cuentas contables (plano)',
    description: 'Retorna un listado plano de todas las cuentas ordenadas ascendentemente por código.',
  })
  @ApiResponse({ status: 200, description: 'Listado plano de cuentas.' })
  async findAll() {
    return this.findAllAccountsUseCase.execute();
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Consultar cuenta por código',
    description: 'Obtiene los detalles de una cuenta específica según su código contable.',
  })
  @ApiParam({ name: 'code', description: 'Código de la cuenta', example: '1105' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada.' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada.' })
  async findByCode(@Param('code') code: string) {
    return this.findAccountByCodeUseCase.execute(code);
  }

  @Patch(':code')
  @ApiOperation({
    summary: 'Renombrar una cuenta contable',
    description: 'Actualiza el nombre descriptivo de una cuenta existente en el catálogo.',
  })
  @ApiParam({ name: 'code', description: 'Código de la cuenta a renombrar', example: '1105' })
  @ApiResponse({ status: 200, description: 'Cuenta renombrada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Nombre inválido o vacío.' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada.' })
  async renameAccount(
    @Param('code') code: string,
    @Body() dto: RenameAccountRequestDto,
  ) {
    return this.renameAccountUseCase.execute({
      code,
      newName: dto.name,
    });
  }

  @Delete(':code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una cuenta contable',
    description:
      'Elimina una cuenta del catálogo. Rechaza la operación con error 400 si la cuenta tiene cuentas hijas asociadas.',
  })
  @ApiParam({ name: 'code', description: 'Código de la cuenta a eliminar', example: '110505' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente.' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar porque tiene cuentas hijas.' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada.' })
  async deleteAccount(@Param('code') code: string) {
    await this.deleteAccountUseCase.execute(code);
    return {
      message: `Cuenta ${code} eliminada exitosamente.`,
    };
  }
}

