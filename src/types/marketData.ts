import { Currency } from './portfolio';

export interface MarketQuote {
  ticker: string;
  name: string;
  price: number;
  currency: Currency;
  change: number;
  changePercent: number;
  previousClose: number;
  high?: number;
  low?: number;
  volume?: number;
  timestamp: string;
}

export interface HistoricalPoint {
  date: string; // YYYY-MM-DD
  price: number;
}

export interface BenchmarkSeries {
  symbol: string; // 'SP500' | 'WIG20' | 'NDX'
  name: string;
  data: HistoricalPoint[];
}

export interface DividendEvent {
  id: string;
  ticker: string;
  exDate: string;
  paymentDate: string;
  amountPerShare: number;
  currency: Currency;
  taxRate: number; // e.g. 0.19 for Poland, 0.15 for US
}
