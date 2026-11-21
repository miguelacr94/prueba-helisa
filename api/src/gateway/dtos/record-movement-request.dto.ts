import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecordMovementRequestDto {
  @ApiProperty({
    description: 'Concepto o descripción del asiento o movimiento contable',
    example: 'Apertura de caja menor sucursal norte',
  })
  @IsString({ message: 'El concepto debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El concepto es obligatorio y no puede estar vacío.' })
  concept!: string;

  @ApiPropertyOptional({
    description: 'Valor del movimiento al débito',
    example: 500000,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El valor débito debe ser numérico.' })
  @Min(0, { message: 'El valor débito no puede ser negativo.' })
  debit?: number;

  @ApiPropertyOptional({
    description: 'Valor del movimiento al crédito',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El valor crédito debe ser numérico.' })
  @Min(0, { message: 'El valor crédito no puede ser negativo.' })
  credit?: number;
}

