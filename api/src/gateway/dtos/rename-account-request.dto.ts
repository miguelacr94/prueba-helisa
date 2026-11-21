import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenameAccountRequestDto {
  @ApiProperty({
    description: 'Nuevo nombre para la cuenta contable.',
    example: 'CAJA GENERAL Y EFECTIVO',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio y no puede estar vacío.' })
  name!: string;
}

