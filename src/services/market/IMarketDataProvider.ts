import { MarketQuote, BenchmarkSeries, DividendEvent } from '../../types/marketData';

export interface IMarketDataProvider {
  getQuote(ticker: string): Promise<MarketQuote>;
  getQuotes(tickers: string[]): Promise<Map<string, MarketQuote>>;
  getBenchmarkHistory(symbol: string): Promise<BenchmarkSeries>;
  getExchangeRate(from: string, to: string): Promise<number>;
  getDividendEvents(ticker: string): Promise<DividendEvent[]>;
}
