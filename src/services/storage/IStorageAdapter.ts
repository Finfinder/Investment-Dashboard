import { Portfolio, Transaction } from '../../types/portfolio';

export interface IStorageAdapter {
  getPortfolios(userId?: string): Promise<Portfolio[]>;
  savePortfolios(portfolios: Portfolio[], userId?: string): Promise<void>;
  getTransactions(userId?: string): Promise<Transaction[]>;
  saveTransactions(transactions: Transaction[], userId?: string): Promise<void>;
  exportBackupData(userId?: string): Promise<string>;
  importBackupData(jsonString: string, userId?: string): Promise<boolean>;
  clearAllData(userId?: string): Promise<void>;
}
