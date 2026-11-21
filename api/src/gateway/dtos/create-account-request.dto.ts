import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { AccountNature } from '../../modules/accounts/domain/enums/account-nature.enum.js';

export class CreateAccountRequestDto {
  @ApiProperty({
    description:
      'Código numérico de la cuenta contable. Su longitud determina el nivel: 1 (Clase), 2 (Grupo), 4 (Cuenta), 6 (Subcuenta).',
    example: '110505',
  })
  @IsString({ message: 'El código debe ser una cadena de texto numérico.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @Matches(/^\d+$/, { message: 'El código solo puede contener dígitos numéricos.' })
  code!: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la cuenta contable.',
    example: 'Caja General',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  name!: string;

  @ApiPropertyOptional({
    description:
      'Naturaleza contable de la cuenta. Obligatorio al crear una Clase (1 dígito). Los descendientes la heredan automáticamente del padre.',
    enum: AccountNature,
    example: AccountNature.DEBITO,
  })
  @IsOptional()
  @IsEnum(AccountNature, { message: 'La naturaleza debe ser DEBITO o CREDITO.' })
  nature?: AccountNature;
}

