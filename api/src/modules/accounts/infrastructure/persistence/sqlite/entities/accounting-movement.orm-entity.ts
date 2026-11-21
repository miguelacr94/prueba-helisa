import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { AccountOrmEntity } from './account.orm-entity.js';

/**
 * Entidad ORM de Movimientos Contables.
 * Modela la relación 1:N entre la tabla 'accounts' y la tabla 'accounting_movements'.
 */
@Entity('accounting_movements')
export class AccountingMovementOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'account_code', type: 'varchar', length: 6 })
  accountCode!: string;

  @Column({ type: 'varchar', length: 255 })
  concept!: string;

  @Column({ type: 'real', default: 0 })
  debit!: number;

  @Column({ type: 'real', default: 0 })
  credit!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  /**
   * Relación N:1 con Account:
   * Cada movimiento pertenece a una única cuenta contable.
   * Restricción ON DELETE RESTRICT: SQLite rechaza la eliminación de una cuenta si tiene movimientos.
   */
  @ManyToOne(() => AccountOrmEntity, (account) => account.movements, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'account_code', referencedColumnName: 'code' })
  account?: Relation<AccountOrmEntity>;
}

