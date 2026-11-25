import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioCalculations } from '../../services/analytics/portfolioCalculations';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const PortfolioDonutChart: React.FC = () => {
  const { portfolios, transactions, quotes } = usePortfolio();

  const activePortfolios = portfolios.filter(p => p.includeInDashboard);

  const portfolioValues = activePortfolios.map(p => {
    const pTxs = transactions.filter(t => t.portfolioId === p.id);
    const pHoldings = PortfolioCalculations.calculateHoldings(pTxs, quotes);
    const val = pHoldings.reduce((sum, h) => sum + h.totalValuePLN, 0);
    return {
      name: p.name,
      value: val,
      color: p.color || '#3b82f6'
    };
  });

  const totalSum = portfolioValues.reduce((s, item) => s + item.value, 0);

  const chartData = {
    labels: portfolioValues.map(item => {
      const pct = totalSum > 0 ? ((item.value / totalSum) * 100).toFixed(2) : '0';
      return `${item.name} (${item.value.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN, ${pct} %)`;
    }),
    datasets: [
      {
        data: portfolioValues.map(item => item.value),
        backgroundColor: [
          '#ef4444', // Red (XTB)
          '#10b981', // Green (Marysia)
          '#8b5cf6', // Purple (ProPicks)
          '#f97316', // Orange (IKE)
          '#06b6d4', // Cyan
          '#ec4899'  // Pink
        ],
        borderColor: '#0b1429',
        borderWidth: 3,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#f8fafc',
          font: {
            family: 'Inter',
            size: 12,
            weight: 600
          },
          padding: 18,
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
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(2) : 0;
            return ` Wartość: ${val.toLocaleString('pl-PL')} PLN (${pct}%)`;
          }
        }
      }
    },
    cutout: '62%'
  };

  return (
    <div className="card-panel" style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textAlign: 'center', color: '#f8fafc', marginBottom: '1.25rem' }}>
        Udział wartości portfeli w sumie inwestycji
      </h3>
      <div style={{ height: '360px', position: 'relative' }}>
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
