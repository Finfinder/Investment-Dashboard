import { describe, it, expect } from 'vitest';
import { PortfolioCalculations } from '../portfolioCalculations';
import { Transaction, Portfolio, AssetCategory } from '../../../types/portfolio';
import { MarketQuote } from '../../../types/marketData';

describe('PortfolioCalculations', () => {
  const mockQuotes = new Map<string, MarketQuote>([
    [
      'CDR.PL',
      {
        ticker: 'CDR.PL',
        name: 'CD PROJEKT',
        price: 150.0,
        currency: 'PLN',
        change: 3.0,
        changePercent: 2.04,
        previousClose: 147.0,
        timestamp: '17:00'
      }
    ],
    [
      'AAPL.US',
      {
        ticker: 'AAPL.US',
        name: 'Apple Inc.',
        price: 200.0,
        currency: 'USD',
        change: -2.0,
        changePercent: -0.99,
        previousClose: 202.0,
        timestamp: '22:00'
      }
    ],
    [
      'SAP.DE',
      {
        ticker: 'SAP.DE',
        name: 'SAP SE',
        price: 180.0,
        currency: 'EUR',
        change: 1.5,
        changePercent: 0.84,
        previousClose: 178.5,
        timestamp: '17:30'
      }
    ],
    [
      'BP.UK',
      {
        ticker: 'BP.UK',
        name: 'BP plc',
        price: 5.0,
        currency: 'GBP',
        change: 0.05,
        changePercent: 1.01,
        previousClose: 4.95,
        timestamp: '16:30'
      }
    ]
  ]);

  describe('calculateHoldings', () => {
    it('returns empty array when transactions list is empty', () => {
      const holdings = PortfolioCalculations.calculateHoldings([], mockQuotes);
      expect(holdings).toEqual([]);
    });

    it('ignores transactions without ticker', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-1',
          portfolioId: 'p1',
          type: 'DEPOSIT',
          date: '2025-01-01T10:00:00Z',
          quantity: 1,
          price: 1000,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 1000
        }
      ];

      const holdings = PortfolioCalculations.calculateHoldings(txs, mockQuotes);
      expect(holdings).toHaveLength(0);
    });

    it('correctly calculates single BUY position in PLN', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-1',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'CDR.PL',
          instrumentName: 'CD PROJEKT',
          assetCategory: 'Akcje GPW',
          date: '2025-01-10T10:00:00Z',
          quantity: 10,
          price: 120.0,
          currency: 'PLN',
          commission: 5.0,
          tax: 0,
          totalValue: 1205.0
        }
      ];

      const holdings = PortfolioCalculations.calculateHoldings(txs, mockQuotes);

      expect(holdings).toHaveLength(1);
      const h = holdings[0];
      expect(h.ticker).toBe('CDR.PL');
      expect(h.quantity).toBe(10);
      expect(h.totalCostPLN).toBe(1205.0);
      expect(h.averageBuyPricePLN).toBe(120.5);
      expect(h.currentPricePLN).toBe(150.0);
      expect(h.totalValuePLN).toBe(1500.0);
      expect(h.unrealizedProfitPLN).toBe(295.0);
      expect(h.unrealizedProfitPercent).toBeCloseTo(24.48, 2);
      expect(h.portfolioSharePercent).toBe(100);
    });

    it('calculates weighted average price across multiple BUY transactions', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-1',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'CDR.PL',
          date: '2025-01-10T10:00:00Z',
          quantity: 10,
          price: 100.0,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 1000.0
        },
        {
          id: 'tx-2',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'CDR.PL',
          date: '2025-01-15T10:00:00Z',
          quantity: 20,
          price: 130.0,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 2600.0
        }
      ];

      const holdings = PortfolioCalculations.calculateHoldings(txs, mockQuotes);
      expect(holdings).toHaveLength(1);
      const h = holdings[0];
      expect(h.quantity).toBe(30);
      expect(h.totalCostPLN).toBe(3600.0);
      expect(h.averageBuyPricePLN).toBe(120.0);
      expect(h.totalValuePLN).toBe(4500.0); // 30 * 150
      expect(h.unrealizedProfitPLN).toBe(900.0);
    });

    it('handles partial SELL transactions maintaining average cost', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-1',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'CDR.PL',
          date: '2025-01-10T10:00:00Z',
          quantity: 20,
          price: 100.0,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 2000.0
        },
        {
          id: 'tx-2',
          portfolioId: 'p1',
          type: 'SELL',
          ticker: 'CDR.PL',
          date: '2025-01-20T10:00:00Z',
          quantity: 5,
          price: 140.0,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 700.0
        }
      ];

      const holdings = PortfolioCalculations.calculateHoldings(txs, mockQuotes);
      expect(holdings).toHaveLength(1);
      const h = holdings[0];
      expect(h.quantity).toBe(15);
      expect(h.totalCostPLN).toBe(1500.0);
      expect(h.averageBuyPricePLN).toBe(100.0);
      expect(h.totalValuePLN).toBe(2250.0); // 15 * 150
      expect(h.unrealizedProfitPLN).toBe(750.0);
    });

    it('removes position completely when fully sold', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-1',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'CDR.PL',
          date: '2025-01-10T10:00:00Z',
          quantity: 10,
          price: 100.0,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 1000.0
        },
        {
          id: 'tx-2',
          portfolioId: 'p1',
          type: 'SELL',
          ticker: 'CDR.PL',
          date: '2025-01-20T10:00:00Z',
          quantity: 10,
          price: 150.0,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 1500.0
        }
      ];

      const holdings = PortfolioCalculations.calculateHoldings(txs, mockQuotes);
      expect(holdings).toHaveLength(0);
    });

    it('correctly applies FX rates for foreign currencies (USD, EUR, GBP)', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-usd',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'AAPL.US',
          date: '2025-01-10T10:00:00Z',
          quantity: 10,
          price: 150.0,
          currency: 'USD',
          commission: 0,
          tax: 0,
          totalValue: 1500.0
        },
        {
          id: 'tx-eur',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'SAP.DE',
          date: '2025-01-12T10:00:00Z',
          quantity: 10,
          price: 160.0,
          currency: 'EUR',
          commission: 0,
          tax: 0,
          totalValue: 1600.0
        },
        {
          id: 'tx-gbp',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'BP.UK',
          date: '2025-01-14T10:00:00Z',
          quantity: 100,
          price: 4.5,
          currency: 'GBP',
          commission: 0,
          tax: 0,
          totalValue: 450.0
        }
      ];

      const usdRate = 4.0;
      const eurRate = 4.5;
      const gbpRate = 5.0;

      const holdings = PortfolioCalculations.calculateHoldings(txs, mockQuotes, usdRate, eurRate, gbpRate);
      expect(holdings).toHaveLength(3);

      const aapl = holdings.find(h => h.ticker === 'AAPL.US')!;
      expect(aapl.averageBuyPriceOriginal).toBe(150.0);
      expect(aapl.averageBuyPricePLN).toBe(600.0); // 150 * 4
      expect(aapl.currentPriceOriginal).toBe(200.0);
      expect(aapl.currentPricePLN).toBe(800.0); // 200 * 4
      expect(aapl.totalValuePLN).toBe(8000.0); // 10 * 800

      const sap = holdings.find(h => h.ticker === 'SAP.DE')!;
      expect(sap.averageBuyPriceOriginal).toBe(160.0);
      expect(sap.averageBuyPricePLN).toBe(720.0); // 160 * 4.5
      expect(sap.currentPriceOriginal).toBe(180.0);
      expect(sap.currentPricePLN).toBe(810.0); // 180 * 4.5
      expect(sap.totalValuePLN).toBe(8100.0); // 10 * 810

      const bp = holdings.find(h => h.ticker === 'BP.UK')!;
      expect(bp.averageBuyPriceOriginal).toBe(4.5);
      expect(bp.averageBuyPricePLN).toBe(22.5); // 4.5 * 5.0
      expect(bp.currentPriceOriginal).toBe(5.0);
      expect(bp.currentPricePLN).toBe(25.0); // 5.0 * 5.0
      expect(bp.totalValuePLN).toBe(2500.0); // 100 * 25
    });

    it('falls back to buy price when quote is missing in quotes map', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-unknown',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'UNKNOWN.PL',
          instrumentName: 'Unknown Corp',
          assetCategory: 'Inne',
          date: '2025-01-01T10:00:00Z',
          quantity: 10,
          price: 50.0,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 500.0
        }
      ];

      const holdings = PortfolioCalculations.calculateHoldings(txs, new Map());
      expect(holdings).toHaveLength(1);
      const h = holdings[0];
      expect(h.ticker).toBe('UNKNOWN.PL');
      expect(h.currentPricePLN).toBe(50.0);
      expect(h.totalValuePLN).toBe(500.0);
      expect(h.unrealizedProfitPLN).toBe(0.0);
      expect(h.unrealizedProfitPercent).toBe(0.0);
    });

    it('handles negative profit/loss gracefully', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-loss',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'CDR.PL',
          date: '2025-01-10T10:00:00Z',
          quantity: 10,
          price: 200.0, // bought at 200, quote is 150
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 2000.0
        }
      ];

      const holdings = PortfolioCalculations.calculateHoldings(txs, mockQuotes);
      expect(holdings).toHaveLength(1);
      const h = holdings[0];
      expect(h.totalCostPLN).toBe(2000.0);
      expect(h.totalValuePLN).toBe(1500.0);
      expect(h.unrealizedProfitPLN).toBe(-500.0);
      expect(h.unrealizedProfitPercent).toBeCloseTo(-25.0, 2);
    });

    it('calculates portfolioSharePercent totaling 100% across multiple holdings', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-1',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'CDR.PL',
          date: '2025-01-01T10:00:00Z',
          quantity: 10,
          price: 150.0, // Value: 1500 PLN
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 1500.0
        },
        {
          id: 'tx-2',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'AAPL.US',
          date: '2025-01-02T10:00:00Z',
          quantity: 5,
          price: 200.0, // Value: 5 * 200 * 3.95 = 3950 PLN
          currency: 'USD',
          commission: 0,
          tax: 0,
          totalValue: 1000.0
        }
      ];

      const holdings = PortfolioCalculations.calculateHoldings(txs, mockQuotes, 3.95);
      expect(holdings).toHaveLength(2);

      const totalVal = holdings[0].totalValuePLN + holdings[1].totalValuePLN;
      const shareSum = holdings[0].portfolioSharePercent + holdings[1].portfolioSharePercent;
      expect(totalVal).toBeGreaterThan(0);
      expect(shareSum).toBeCloseTo(100, 1);
    });
  });

  describe('groupHoldings', () => {
    it('returns empty array when holdings are empty', () => {
      const groups = PortfolioCalculations.groupHoldings([]);
      expect(groups).toEqual([]);
    });

    it('groups holdings by AssetCategory and aggregates stats', () => {
      const mockHoldings = [
        {
          ticker: 'CDR.PL',
          name: 'CD PROJEKT',
          category: 'Akcje GPW' as AssetCategory,
          currency: 'PLN' as const,
          quantity: 10,
          averageBuyPricePLN: 100,
          averageBuyPriceOriginal: 100,
          currentPricePLN: 120,
          currentPriceOriginal: 120,
          currentPriceTime: '17:00',
          totalValuePLN: 1200,
          totalCostPLN: 1000,
          unrealizedProfitPLN: 200,
          unrealizedProfitPercent: 20,
          dailyChangePercent: 2,
          dailyProfitPLN: 24,
          portfolioSharePercent: 40,
          investmentPeriodDays: 30,
          firstBuyDate: '2025-01-01'
        },
        {
          ticker: 'PKO.PL',
          name: 'PKO BP',
          category: 'Akcje GPW' as AssetCategory,
          currency: 'PLN' as const,
          quantity: 20,
          averageBuyPricePLN: 40,
          averageBuyPriceOriginal: 40,
          currentPricePLN: 50,
          currentPriceOriginal: 50,
          currentPriceTime: '17:00',
          totalValuePLN: 1000,
          totalCostPLN: 800,
          unrealizedProfitPLN: 200,
          unrealizedProfitPercent: 25,
          dailyChangePercent: 1,
          dailyProfitPLN: 10,
          portfolioSharePercent: 33.33,
          investmentPeriodDays: 20,
          firstBuyDate: '2025-01-10'
        },
        {
          ticker: 'VWCE.DE',
          name: 'Vanguard All-World',
          category: 'ETF' as AssetCategory,
          currency: 'EUR' as const,
          quantity: 2,
          averageBuyPricePLN: 350,
          averageBuyPriceOriginal: 80,
          currentPricePLN: 400,
          currentPriceOriginal: 90,
          currentPriceTime: '17:30',
          totalValuePLN: 800,
          totalCostPLN: 700,
          unrealizedProfitPLN: 100,
          unrealizedProfitPercent: 14.28,
          dailyChangePercent: 0.5,
          dailyProfitPLN: 4,
          portfolioSharePercent: 26.67,
          investmentPeriodDays: 10,
          firstBuyDate: '2025-01-20'
        }
      ];

      const groups = PortfolioCalculations.groupHoldings(mockHoldings);
      expect(groups).toHaveLength(2);

      const gpwGroup = groups.find(g => g.category === 'Akcje GPW')!;
      expect(gpwGroup).toBeDefined();
      expect(gpwGroup.assetCount).toBe(2);
      expect(gpwGroup.totalCostPLN).toBe(1800);
      expect(gpwGroup.totalValuePLN).toBe(2200);
      expect(gpwGroup.totalProfitPLN).toBe(400);
      expect(gpwGroup.totalDailyProfitPLN).toBe(34);
      expect(gpwGroup.averageReturnPercent).toBeCloseTo(22.22, 2);

      const etfGroup = groups.find(g => g.category === 'ETF')!;
      expect(etfGroup).toBeDefined();
      expect(etfGroup.assetCount).toBe(1);
      expect(etfGroup.totalValuePLN).toBe(800);
      expect(etfGroup.totalCostPLN).toBe(700);
    });
  });

  describe('calculateSummaryStats', () => {
    it('returns zeroes when portfolios or transactions are empty', () => {
      const stats = PortfolioCalculations.calculateSummaryStats([], [], mockQuotes);
      expect(stats.totalValuePLN).toBe(0);
      expect(stats.totalProfitPLN).toBe(0);
      expect(stats.totalReturnPercent).toBe(0);
      expect(stats.gainersCount).toBe(0);
      expect(stats.losersCount).toBe(0);
    });

    it('only includes portfolios with includeInDashboard === true', () => {
      const portfolios: Portfolio[] = [
        {
          id: 'p-inc',
          name: 'Included Portfolio',
          currency: 'PLN',
          includeInDashboard: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 'p-exc',
          name: 'Excluded Portfolio',
          currency: 'PLN',
          includeInDashboard: false,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];

      const txs: Transaction[] = [
        {
          id: 'tx-inc',
          portfolioId: 'p-inc',
          type: 'BUY',
          ticker: 'CDR.PL',
          date: '2025-01-01T10:00:00Z',
          quantity: 10,
          price: 100, // Quote: 150 -> Value 1500, Profit 500
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 1000
        },
        {
          id: 'tx-exc',
          portfolioId: 'p-exc',
          type: 'BUY',
          ticker: 'CDR.PL',
          date: '2025-01-01T10:00:00Z',
          quantity: 100, // should be ignored
          price: 100,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 10000
        }
      ];

      const stats = PortfolioCalculations.calculateSummaryStats(portfolios, txs, mockQuotes);
      expect(stats.totalValuePLN).toBe(1500);
      expect(stats.totalProfitPLN).toBe(500);
      expect(stats.totalReturnPercent).toBeCloseTo(50.0, 2);
    });

    it('correctly categorizes gainers and losers', () => {
      const portfolios: Portfolio[] = [
        {
          id: 'p1',
          name: 'Main',
          currency: 'PLN',
          includeInDashboard: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];

      const txs: Transaction[] = [
        {
          id: 'tx-gainer',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'CDR.PL', // quote changePercent: +2.04%
          date: '2025-01-01T10:00:00Z',
          quantity: 5,
          price: 150,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 750
        },
        {
          id: 'tx-loser',
          portfolioId: 'p1',
          type: 'BUY',
          ticker: 'AAPL.US', // quote changePercent: -0.99%
          date: '2025-01-01T10:00:00Z',
          quantity: 5,
          price: 200,
          currency: 'USD',
          commission: 0,
          tax: 0,
          totalValue: 1000
        }
      ];

      const stats = PortfolioCalculations.calculateSummaryStats(portfolios, txs, mockQuotes);
      expect(stats.gainersCount).toBe(1);
      expect(stats.losersCount).toBe(1);
    });
  });
});
