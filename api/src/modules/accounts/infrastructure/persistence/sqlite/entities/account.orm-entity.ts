import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AccountingMovementOrmEntity } from './accounting-movement.orm-entity.js';

/**
 * Entidad ORM de Cuentas Contables (PUC).
 * Modela la persistencia en SQLite con restricciones relacionales e índices.
 */
@Entity('accounts')
export class AccountOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  level!: string;

  @Column({ type: 'varchar', length: 20 })
  nature!: string;

  @Column({ name: 'parent_code', type: 'varchar', length: 6, nullable: true })
  parentCode!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Relación Autorreferencial Muchos a Uno (N:1):
   * Cada cuenta hija apunta a una única cuenta padre.
   * Restricción ON DELETE RESTRICT: Impide borrar el padre en la BD si existen hijas.
   */
  @ManyToOne(() => AccountOrmEntity, (parent) => parent.children, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'parent_code', referencedColumnName: 'code' })
  parent?: AccountOrmEntity | null;

  /**
   * Relación Autorreferencial Uno a Muchos (1:N):
   * Una cuenta padre puede tener múltiples cuentas hijas.
   */
  @OneToMany(() => AccountOrmEntity, (child) => child.parent)
  children?: AccountOrmEntity[];

  /**
   * Relación Uno a Muchos (1:N) con Movimientos Contables:
   * Solo las cuentas hoja registran movimientos.
   */
  @OneToMany(() => AccountingMovementOrmEntity, (movement) => movement.account)
  movements?: AccountingMovementOrmEntity[];
}

