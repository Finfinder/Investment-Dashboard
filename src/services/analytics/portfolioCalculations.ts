import { 
  Portfolio, 
  Transaction, 
  HoldingPosition, 
  GroupedHoldings, 
  PortfolioSummaryStats, 
  AssetCategory 
} from '../../types/portfolio';
import { MarketQuote } from '../../types/marketData';

export class PortfolioCalculations {
  /**
   * Calculates current holdings for a given portfolio or list of transactions
   */
  public static calculateHoldings(
    transactions: Transaction[],
    quotes: Map<string, MarketQuote>,
    usdPlnRate: number = 3.95,
    eurPlnRate: number = 4.30,
    gbpPlnRate: number = 5.10
  ): HoldingPosition[] {
    const holdingsMap = new Map<string, {
      ticker: string;
      name: string;
      category: AssetCategory;
      currency: string;
      quantity: number;
      totalCostPLN: number;
      totalCostOriginal: number;
      firstBuyDate: string;
    }>();

    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const tx of sorted) {
      if (!tx.ticker) continue;
      const ticker = tx.ticker.toUpperCase();
      const existing = holdingsMap.get(ticker) || {
        ticker,
        name: tx.instrumentName || ticker,
        category: tx.assetCategory || 'Akcje GPW',
        currency: tx.currency || 'PLN',
        quantity: 0,
        totalCostPLN: 0,
        totalCostOriginal: 0,
        firstBuyDate: tx.date
      };

      const fxRate = tx.currency === 'USD' ? usdPlnRate : tx.currency === 'EUR' ? eurPlnRate : tx.currency === 'GBP' ? gbpPlnRate : 1.0;

      if (tx.type === 'BUY') {
        existing.quantity += tx.quantity;
        existing.totalCostOriginal += tx.quantity * tx.price + tx.commission;
        existing.totalCostPLN += (tx.quantity * tx.price + tx.commission) * fxRate;
        if (!existing.firstBuyDate || new Date(tx.date) < new Date(existing.firstBuyDate)) {
          existing.firstBuyDate = tx.date;
        }
      } else if (tx.type === 'SELL') {
        if (existing.quantity > 0) {
          const avgCostOriginal = existing.totalCostOriginal / existing.quantity;
          const avgCostPLN = existing.totalCostPLN / existing.quantity;
          existing.quantity -= tx.quantity;
          existing.totalCostOriginal -= tx.quantity * avgCostOriginal;
          existing.totalCostPLN -= tx.quantity * avgCostPLN;
        }
      }

      holdingsMap.set(ticker, existing);
    }

    // Filter active holdings (quantity > 0) and compute current market metrics
    const result: HoldingPosition[] = [];
    const now = new Date();

    for (const [ticker, item] of holdingsMap.entries()) {
      if (item.quantity <= 0.0001) continue;

      const quote = quotes.get(ticker) || {
        ticker,
        name: item.name,
        price: item.totalCostOriginal / item.quantity,
        currency: item.currency as any,
        changePercent: 0,
        change: 0,
        previousClose: item.totalCostOriginal / item.quantity,
        timestamp: '16:00'
      };

      const fxRate = item.currency === 'USD' ? usdPlnRate : item.currency === 'EUR' ? eurPlnRate : item.currency === 'GBP' ? gbpPlnRate : 1.0;
      const currentPriceOriginal = quote.price;
      const currentPricePLN = currentPriceOriginal * fxRate;

      const avgBuyPriceOriginal = item.totalCostOriginal / item.quantity;
      const avgBuyPricePLN = item.totalCostPLN / item.quantity;

      const totalValuePLN = item.quantity * currentPricePLN;
      const totalCostPLN = item.totalCostPLN;
      const unrealizedProfitPLN = totalValuePLN - totalCostPLN;
      const unrealizedProfitPercent = totalCostPLN > 0 ? (unrealizedProfitPLN / totalCostPLN) * 100 : 0;

      const dailyChangePercent = quote.changePercent || 0;
      const dailyProfitPLN = (totalValuePLN * dailyChangePercent) / 100;

      const firstDate = new Date(item.firstBuyDate);
      const diffTime = Math.abs(now.getTime() - firstDate.getTime());
      const investmentPeriodDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      result.push({
        ticker,
        name: item.name || quote.name || ticker,
        category: item.category,
        currency: item.currency as any,
        quantity: parseFloat(item.quantity.toFixed(4)),
        averageBuyPricePLN: parseFloat(avgBuyPricePLN.toFixed(2)),
        averageBuyPriceOriginal: parseFloat(avgBuyPriceOriginal.toFixed(2)),
        currentPricePLN: parseFloat(currentPricePLN.toFixed(2)),
        currentPriceOriginal: parseFloat(currentPriceOriginal.toFixed(2)),
        currentPriceTime: quote.timestamp || '16:00',
        totalValuePLN: parseFloat(totalValuePLN.toFixed(2)),
        totalCostPLN: parseFloat(totalCostPLN.toFixed(2)),
        unrealizedProfitPLN: parseFloat(unrealizedProfitPLN.toFixed(2)),
        unrealizedProfitPercent: parseFloat(unrealizedProfitPercent.toFixed(2)),
        dailyChangePercent: parseFloat(dailyChangePercent.toFixed(2)),
        dailyProfitPLN: parseFloat(dailyProfitPLN.toFixed(2)),
        portfolioSharePercent: 0, // Will be computed after total sum
        investmentPeriodDays,
        firstBuyDate: item.firstBuyDate
      });
    }

    const portfolioTotalValuePLN = result.reduce((sum, h) => sum + h.totalValuePLN, 0);
    result.forEach(h => {
      h.portfolioSharePercent = portfolioTotalValuePLN > 0 
        ? parseFloat(((h.totalValuePLN / portfolioTotalValuePLN) * 100).toFixed(2)) 
        : 0;
    });

    return result;
  }

  /**
   * Groups holdings by AssetCategory
   */
  public static groupHoldings(holdings: HoldingPosition[]): GroupedHoldings[] {
    const map = new Map<AssetCategory, HoldingPosition[]>();

    for (const h of holdings) {
      const list = map.get(h.category) || [];
      list.push(h);
      map.set(h.category, list);
    }

    const totalPortfolioValue = holdings.reduce((s, h) => s + h.totalValuePLN, 0);
    const groups: GroupedHoldings[] = [];

    for (const [category, list] of map.entries()) {
      const totalValuePLN = list.reduce((s, h) => s + h.totalValuePLN, 0);
      const totalCostPLN = list.reduce((s, h) => s + h.totalCostPLN, 0);
      const totalProfitPLN = totalValuePLN - totalCostPLN;
      const totalDailyProfitPLN = list.reduce((s, h) => s + h.dailyProfitPLN, 0);

      const avgReturn = totalCostPLN > 0 ? (totalProfitPLN / totalCostPLN) * 100 : 0;
      const avgDailyChange = totalValuePLN > 0 
        ? list.reduce((s, h) => s + (h.dailyChangePercent * h.totalValuePLN), 0) / totalValuePLN 
        : 0;

      groups.push({
        category,
        holdings: list,
        totalValuePLN: parseFloat(totalValuePLN.toFixed(2)),
        totalCostPLN: parseFloat(totalCostPLN.toFixed(2)),
        totalProfitPLN: parseFloat(totalProfitPLN.toFixed(2)),
        totalDailyProfitPLN: parseFloat(totalDailyProfitPLN.toFixed(2)),
        averageReturnPercent: parseFloat(avgReturn.toFixed(2)),
        averageDailyChangePercent: parseFloat(avgDailyChange.toFixed(2)),
        portfolioSharePercent: totalPortfolioValue > 0 ? parseFloat(((totalValuePLN / totalPortfolioValue) * 100).toFixed(2)) : 0,
        assetCount: list.length
      });
    }

    return groups;
  }

  /**
   * Calculates overall Dashboard summary statistics across portfolios
   */
  public static calculateSummaryStats(
    portfolios: Portfolio[],
    transactions: Transaction[],
    quotes: Map<string, MarketQuote>
  ): PortfolioSummaryStats {
    const includedPortfolioIds = new Set(
      portfolios.filter(p => p.includeInDashboard).map(p => p.id)
    );

    const relevantTxs = transactions.filter(t => includedPortfolioIds.has(t.portfolioId));
    const holdings = PortfolioCalculations.calculateHoldings(relevantTxs, quotes);

    const totalValuePLN = holdings.reduce((s, h) => s + h.totalValuePLN, 0);
    const totalCostPLN = holdings.reduce((s, h) => s + h.totalCostPLN, 0);
    const totalProfitPLN = totalValuePLN - totalCostPLN;
    const dailyProfitPLN = holdings.reduce((s, h) => s + h.dailyProfitPLN, 0);

    const dailyChangePercent = totalValuePLN > 0 
      ? (dailyProfitPLN / totalValuePLN) * 100 
      : 0;

    const totalReturnPercent = totalCostPLN > 0 ? (totalProfitPLN / totalCostPLN) * 100 : 0;

    // CAGR estimation over portfolio history
    const oldestDate = relevantTxs.reduce((min, t) => {
      const d = new Date(t.date).getTime();
      return d < min ? d : min;
    }, Date.now());

    const years = Math.max(0.1, (Date.now() - oldestDate) / (1000 * 60 * 60 * 24 * 365.25));
    const cagrPercent = totalCostPLN > 0 && totalValuePLN > 0
      ? (Math.pow(totalValuePLN / totalCostPLN, 1 / years) - 1) * 100
      : 0;

    const gainersCount = holdings.filter(h => h.dailyChangePercent >= 0).length;
    const losersCount = holdings.filter(h => h.dailyChangePercent < 0).length;

    return {
      totalValuePLN: parseFloat(totalValuePLN.toFixed(2)),
      dailyChangePercent: parseFloat(dailyChangePercent.toFixed(2)),
      dailyProfitPLN: parseFloat(dailyProfitPLN.toFixed(2)),
      totalProfitPLN: parseFloat(totalProfitPLN.toFixed(2)),
      totalReturnPercent: parseFloat(totalReturnPercent.toFixed(2)),
      cagrPercent: parseFloat(cagrPercent.toFixed(2)),
      currentProfitPLN: parseFloat(totalProfitPLN.toFixed(2)),
      gainersCount,
      losersCount
    };
  }
}
