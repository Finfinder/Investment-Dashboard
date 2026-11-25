import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StooqProvider } from '../../services/market/StooqProvider';
import { BenchmarkSeries } from '../../types/marketData';
import { PortfolioCalculations } from '../../services/analytics/portfolioCalculations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const marketProvider = new StooqProvider();

export const PerformanceChart: React.FC = () => {
  const { portfolios, transactions, quotes } = usePortfolio();
  const [benchmarkSymbol, setBenchmarkSymbol] = useState<string>('SP500');
  const [chartType, setChartType] = useState<'zmiana' | 'drawdown'>('zmiana');
  const [startDate, setStartDate] = useState<string>('2025-12-01');
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkSeries | null>(null);

  useEffect(() => {
    marketProvider.getBenchmarkHistory(benchmarkSymbol).then(setBenchmarkData);
  }, [benchmarkSymbol]);

  if (!benchmarkData) return null;

  const dates = benchmarkData.data.map(p => p.date);
  const colors = ['#ef4444', '#10b981', '#8b5cf6', '#f97316', '#06b6d4'];

  const datasets = [];

  // Add benchmark dataset (gray curve)
  const baseBenchmarkPrice = benchmarkData.data[0]?.price || 1;
  const benchmarkValues = benchmarkData.data.map(p => {
    if (chartType === 'zmiana') {
      return parseFloat((((p.price - baseBenchmarkPrice) / baseBenchmarkPrice) * 100).toFixed(2));
    } else {
      // Drawdown curve
      return Math.min(0, parseFloat((((p.price - baseBenchmarkPrice) / baseBenchmarkPrice) * 50).toFixed(2)));
    }
  });

  datasets.push({
    label: `Benchmark (${benchmarkData.name})`,
    data: benchmarkValues,
    borderColor: '#94a3b8',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 4,
    tension: 0.3
  });

  // Add portfolio curves strictly based on real transactions
  portfolios.filter(p => p.includeInDashboard).forEach((p, idx) => {
    const portfolioColor = p.color || colors[idx % colors.length];
    const pTxs = transactions.filter(t => t.portfolioId === p.id);

    const portfolioCurve = dates.map((dateStr) => {
      // Portfolio with 0 transactions has exactly 0.00% return
      if (pTxs.length === 0) {
        return 0;
      }

      // Filter transactions up to dateStr
      const txsUpToDate = pTxs.filter(t => t.date.substring(0, 10) <= dateStr);
      if (txsUpToDate.length === 0) {
        return 0;
      }

      // Calculate cumulative return percentage for transactions up to dateStr
      const holdingsUpToDate = PortfolioCalculations.calculateHoldings(txsUpToDate, quotes);
      const totalVal = holdingsUpToDate.reduce((s: number, h: any) => s + h.totalValuePLN, 0);
      const totalCost = holdingsUpToDate.reduce((s: number, h: any) => s + h.totalCostPLN, 0);

      if (totalCost <= 0) return 0;

      const returnPct = ((totalVal - totalCost) / totalCost) * 100;

      if (chartType === 'zmiana') {
        return parseFloat(returnPct.toFixed(2));
      } else {
        return Math.min(0, parseFloat(returnPct.toFixed(2)));
      }
    });

    datasets.push({
      label: p.name,
      data: portfolioCurve,
      borderColor: portfolioColor,
      backgroundColor: portfolioColor + '20',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3
    });
  });

  const data = {
    labels: dates,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f8fafc',
          font: { family: 'Inter', size: 12, weight: 600 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#091020',
        borderColor: '#1a2847',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#38bdf8',
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw}%`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(26, 40, 71, 0.4)' },
        ticks: { color: '#64748b', maxTicksLimit: 12, font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(26, 40, 71, 0.6)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          callback: (val: any) => `${val}%`
        },
        title: {
          display: true,
          text: chartType === 'zmiana' ? 'Stopa zwrotu [%]' : 'Drawdown [%]',
          color: '#94a3b8',
          font: { family: 'Inter', size: 12, weight: 600 }
        }
      }
    }
  };

  return (
    <div className="card-panel" style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem',
        borderBottom: '1px solid #162340',
        paddingBottom: '0.85rem'
      }}>
        {/* Benchmark Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="form-label" style={{ marginBottom: 0 }}>Benchmark</span>
          <select
            value={benchmarkSymbol}
            onChange={(e) => setBenchmarkSymbol(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="SP500">S&P 500 (SP500)</option>
            <option value="WIG20">WIG20 (WIG20.PL)</option>
            <option value="NDX">Nasdaq 100 (NDX)</option>
          </select>
        </div>

        {/* Start Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="form-label" style={{ marginBottom: 0 }}>Data początkowa</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
          />
        </div>

        {/* Chart Type Radio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="form-label" style={{ marginBottom: 0 }}>Typ wykresu</span>
          <label style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="chartType"
              checked={chartType === 'zmiana'}
              onChange={() => setChartType('zmiana')}
            />
            zmiana
          </label>
          <label style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="chartType"
              checked={chartType === 'drawdown'}
              onChange={() => setChartType('drawdown')}
            />
            drawdown
          </label>
        </div>
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textAlign: 'center', color: '#f8fafc', marginBottom: '1rem' }}>
        Stopa zwrotu portfeli
      </h3>

      <div style={{ height: '380px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
