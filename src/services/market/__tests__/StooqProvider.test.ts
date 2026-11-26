import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StooqProvider } from '../StooqProvider';

describe('StooqProvider', () => {
  let provider: StooqProvider;

  beforeEach(() => {
    provider = new StooqProvider();
  });

  describe('getQuote and getQuotes', () => {
    it('returns market quote from reference database for known ticker', async () => {
      const quote = await provider.getQuote('MIL.PL');

      expect(quote.ticker).toBe('MIL.PL');
      expect(quote.name).toBe('MILLENNIUM');
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.currency).toBe('PLN');
    });

    it('returns quote for US and European tickers with respective currencies', async () => {
      const usQuote = await provider.getQuote('AMKR');
      expect(usQuote.currency).toBe('USD');

      const deQuote = await provider.getQuote('VWCE.DE');
      expect(deQuote.currency).toBe('PLN');
    });

    it('returns fallback quote for unknown ticker', async () => {
      const quote = await provider.getQuote('XYZ123.PL');

      expect(quote.ticker).toBe('XYZ123.PL');
      expect(quote.price).toBe(100.0);
      expect(quote.currency).toBe('PLN');
    });

    it('fetches multiple quotes in parallel using getQuotes', async () => {
      const quotesMap = await provider.getQuotes(['MIL.PL', 'PCO.PL', 'AMKR']);

      expect(quotesMap.size).toBe(3);
      expect(quotesMap.has('MIL.PL')).toBe(true);
      expect(quotesMap.has('PCO.PL')).toBe(true);
      expect(quotesMap.has('AMKR')).toBe(true);
    });
  });

  describe('getExchangeRate', () => {
    it('returns 1.0 when from and to currencies are the same', async () => {
      const rate = await provider.getExchangeRate('PLN', 'PLN');
      expect(rate).toBe(1.0);
    });

    it('returns correct rates for foreign currencies to PLN', async () => {
      const usdPln = await provider.getExchangeRate('USD', 'PLN');
      const eurPln = await provider.getExchangeRate('EUR', 'PLN');
      const gbpPln = await provider.getExchangeRate('GBP', 'PLN');

      expect(usdPln).toBeCloseTo(3.95, 2);
      expect(eurPln).toBeCloseTo(4.30, 2);
      expect(gbpPln).toBeCloseTo(5.10, 2);
    });

    it('returns inverse rates for PLN to foreign currencies', async () => {
      const plnUsd = await provider.getExchangeRate('PLN', 'USD');
      expect(plnUsd).toBeCloseTo(1 / 3.95, 2);
    });
  });

  describe('getBenchmarkHistory', () => {
    it('generates 181 historical data points for SP500', async () => {
      const series = await provider.getBenchmarkHistory('SP500');

      expect(series.symbol).toBe('SP500');
      expect(series.name).toBe('S&P 500');
      expect(series.data).toHaveLength(181);
      expect(series.data[0].price).toBeGreaterThan(0);
      expect(series.data[0].date).toBeDefined();
    });

    it('generates historical data points for WIG20', async () => {
      const series = await provider.getBenchmarkHistory('WIG20');

      expect(series.symbol).toBe('WIG20');
      expect(series.name).toBe('WIG20');
      expect(series.data).toHaveLength(181);
    });
  });

  describe('getDividendEvents', () => {
    it('returns dividend events for ticker', async () => {
      const events = await provider.getDividendEvents('PKO.PL');

      expect(events).toHaveLength(1);
      expect(events[0].ticker).toBe('PKO.PL');
      expect(events[0].amountPerShare).toBe(1.25);
      expect(events[0].currency).toBe('PLN');
      expect(events[0].taxRate).toBe(0.19);
    });
  });
});
