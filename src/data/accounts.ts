import rawAccounts from './accounts.json';
import { accountsSchema } from '../types/account';

const parsedAccounts = accountsSchema.safeParse(rawAccounts);

if (!parsedAccounts.success) {
  throw new Error('The bundled account dataset is invalid.');
}

export const accounts = parsedAccounts.data;
export const IS_DEMO_DATASET = false;
