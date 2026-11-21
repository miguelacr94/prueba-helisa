export type AccountLevel = 'CLASE' | 'GRUPO' | 'CUENTA' | 'SUBCUENTA';
export type AccountNature = 'DEBITO' | 'CREDITO';

export interface Account {
  code: string;
  name: string;
  nature: AccountNature;
  level: AccountLevel;
  hasChildren: boolean;
  acceptsMovements: boolean;
  parentCode: string | null;
}

export interface AccountTreeNode extends Account {
  children: AccountTreeNode[];
}

export interface CreateAccountInput {
  code: string;
  name: string;
  nature?: AccountNature;
}

export function calculateAccountLevel(code: string): AccountLevel | null {
  const len = code.trim().length;
  switch (len) {
    case 1:
      return 'CLASE';
    case 2:
      return 'GRUPO';
    case 4:
      return 'CUENTA';
    case 6:
      return 'SUBCUENTA';
    default:
      return null;
  }
}

export function getExpectedParentCode(code: string): string | null {
  const trimmed = code.trim();
  switch (trimmed.length) {
    case 6:
      return trimmed.substring(0, 4);
    case 4:
      return trimmed.substring(0, 2);
    case 2:
      return trimmed.substring(0, 1);
    case 1:
    default:
      return null;
  }
}

export function getLevelBadgeStyle(level: AccountLevel): { label: string; badgeClass: string } {
  switch (level) {
    case 'CLASE':
      return { label: 'Clase (1 dígito)', badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    case 'GRUPO':
      return { label: 'Grupo (2 dígitos)', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'CUENTA':
      return { label: 'Cuenta (4 dígitos)', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    case 'SUBCUENTA':
      return { label: 'Subcuenta (6 dígitos)', badgeClass: 'bg-purple-100 text-purple-700 border-purple-200' };
  }
}

