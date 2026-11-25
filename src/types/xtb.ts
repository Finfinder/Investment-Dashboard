import { Transaction } from './portfolio';

export interface XTBRowCashOperation {
  type: string;
  ticker?: string;
  instrument?: string;
  time: string;
  amount: number;
  id?: string;
  comment?: string;
  product?: string;
}

export interface XTBRowClosedPosition {
  instrument: string;
  category?: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  openTime: string;
  closePrice: number;
  closeTime: string;
  product?: string;
  profitLoss: number;
  grossProfit?: number;
  purchaseValue?: number;
  saleValue?: number;
  commission?: number;
  openConversionRate?: number;
  closeConversionRate?: number;
  positionId?: string;
  comment?: string;
}

export interface XTBImportParseResult {
  accountNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  cashOperationsCount: number;
  closedPositionsCount: number;
  transactions: Transaction[];
  warnings: string[];
  rawSummary: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalDividends: number;
    totalTrades: number;
  };
}
