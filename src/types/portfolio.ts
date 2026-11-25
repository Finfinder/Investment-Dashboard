export type Currency = 'PLN' | 'USD' | 'EUR' | 'GBP' | 'CHF';

export type AssetCategory = 
  | 'Akcje GPW'
  | 'Akcje NewConnect'
  | 'Obligacje Catalyst'
  | 'Akcje NASDAQ'
  | 'Akcje NYSE'
  | 'Akcje Europejskie'
  | 'ETF'
  | 'Surowce'
  | 'Indeksy'
  | 'Forex'
  | 'Krypto'
  | 'Inne';

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL' | 'FEE' | 'TAX' | 'INTEREST';

export interface Transaction {
  id: string;
  portfolioId: string;
  type: TransactionType;
  ticker?: string;
  instrumentName?: string;
  assetCategory?: AssetCategory;
  date: string; // ISO String (YYYY-MM-DDTHH:mm:ss)
  quantity: number;
  price: number; // Price per unit in transaction currency
  currency: Currency;
  commission: number; // Commission amount
  commissionCurrency?: Currency;
  tax: number; // Tax paid (e.g. WHT on dividends or PIT)
  totalValue: number; // Total monetary impact in transaction currency
  exchangeRateToPLN?: number; // Historical rate at transaction date
  includeInPIT?: boolean;
  linkedBuyTransactionId?: string; // For manual FIFO override on SELL
  comment?: string;
  xtbId?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  currency: Currency;
  includeInDashboard: boolean; // ∑ icon toggle
  description?: string;
  createdAt: string;
  updatedAt: string;
  color?: string; // Color badge for charts
}

export interface HoldingPosition {
  ticker: string;
  name: string;
  category: AssetCategory;
  currency: Currency;
  quantity: number;
  averageBuyPricePLN: number;
  averageBuyPriceOriginal: number;
  currentPricePLN: number;
  currentPriceOriginal: number;
  currentPriceTime: string;
  totalValuePLN: number;
  totalCostPLN: number;
  unrealizedProfitPLN: number;
  unrealizedProfitPercent: number;
  dailyChangePercent: number;
  dailyProfitPLN: number;
  portfolioSharePercent: number;
  investmentPeriodDays: number;
  firstBuyDate: string;
}

export interface GroupedHoldings {
  category: AssetCategory;
  holdings: HoldingPosition[];
  totalValuePLN: number;
  totalCostPLN: number;
  totalProfitPLN: number;
  totalDailyProfitPLN: number;
  averageReturnPercent: number;
  averageDailyChangePercent: number;
  portfolioSharePercent: number;
  assetCount: number;
}

export interface PortfolioSummaryStats {
  totalValuePLN: number;
  dailyChangePercent: number;
  dailyProfitPLN: number;
  totalProfitPLN: number; // Current portfolio profit
  totalReturnPercent: number;
  cagrPercent: number; // Annualized return %
  currentProfitPLN: number;
  gainersCount: number;
  losersCount: number;
}
