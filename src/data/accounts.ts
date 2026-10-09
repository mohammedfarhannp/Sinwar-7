import rawAccounts from './accounts.json';
import type { Account } from '../types/account';

// The build pipeline validates this generated dataset before production bundling.
export const accounts = rawAccounts as Account[];
