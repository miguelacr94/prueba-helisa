import { AccountNature } from '../../domain/enums/account-nature.enum.js';

export interface CreateAccountCommand {
  code: string;
  name: string;
  nature?: AccountNature;
}

