import { AccountOutputDto } from './account-output.dto.js';

export interface AccountTreeNodeDto extends AccountOutputDto {
  children: AccountTreeNodeDto[];
}

