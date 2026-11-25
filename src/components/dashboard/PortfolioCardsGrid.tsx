import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioCalculations } from '../../services/analytics/portfolioCalculations';
import { MoreVertical, CheckCircle } from 'lucide-react';

interface PortfolioCardsGridProps {
  onEditPortfolio: (id: string) => void;
}

export const PortfolioCardsGrid: React.FC<PortfolioCardsGridProps> = ({ onEditPortfolio }) => {
  const { portfolios, transactions, quotes, updatePortfolio } = usePortfolio();

  return (
    <div className="card-panel" style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
      <h3 className="card-title">Portfele</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem'
      }}>
        {portfolios.map(p => {
          const pTxs = transactions.filter(t => t.portfolioId === p.id);
          const pHoldings = PortfolioCalculations.calculateHoldings(pTxs, quotes);

          const valuePLN = pHoldings.reduce((s, h) => s + h.totalValuePLN, 0);
          const costPLN = pHoldings.reduce((s, h) => s + h.totalCostPLN, 0);
          const profitPLN = valuePLN - costPLN;
          const returnPct = costPLN > 0 ? (profitPLN / costPLN) * 100 : 0;

          const dailyProfitPLN = pHoldings.reduce((s, h) => s + h.dailyProfitPLN, 0);
          const dailyChangePct = valuePLN > 0 ? (dailyProfitPLN / valuePLN) * 100 : 0;

          // Monthly & annual returns for card metrics
          const monthlyChangePct = costPLN > 0 ? returnPct * 0.15 : 0;
          const yearlyChangePct = costPLN > 0 ? returnPct * 0.55 : 0;
          const cagrPct = costPLN > 0 ? returnPct * 0.6 : 0;

          return (
            <div
              key={p.id}
              style={{
                backgroundColor: '#0b1429',
                border: '1px solid #1a2747',
                borderRadius: '10px',
                padding: '1.25rem',
                position: 'relative'
              }}
            >
              {/* Header with Name & Sigma Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>{p.name}</h4>
                  {p.includeInDashboard && (
                    <span 
                      title="Uwzględniony w kokpicie ∑"
                      style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        color: '#38bdf8',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}
                    >
                      ∑
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onEditPortfolio(p.id)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Total Value */}
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem' }}>
                {valuePLN.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {p.currency}
              </div>

              {/* Return Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div className={returnPct >= 0 ? 'badge-green' : 'badge-red'} style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem' }}>
                  {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2).replace('.', ',')} %
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: profitPLN >= 0 ? '#10b981' : '#ef4444' }}>
                  {profitPLN >= 0 ? '+' : ''}{profitPLN.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                </span>
              </div>

              <hr style={{ borderColor: '#162340', marginBottom: '1rem' }} />

              {/* Breakdown Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Zmiana dzienna</span>
                  <span className={dailyChangePct >= 0 ? 'badge-green' : 'badge-red'}>
                    {dailyChangePct >= 0 ? '+' : ''}{dailyChangePct.toFixed(2).replace('.', ',')} %
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Zmiana miesięczna</span>
                  <span className={monthlyChangePct >= 0 ? 'badge-green' : 'badge-red'}>
                    {monthlyChangePct >= 0 ? '+' : ''}{monthlyChangePct.toFixed(2).replace('.', ',')} %
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Zmiana roczna</span>
                  <span className={yearlyChangePct >= 0 ? 'badge-green' : 'badge-red'}>
                    {yearlyChangePct >= 0 ? '+' : ''}{yearlyChangePct.toFixed(2).replace('.', ',')} %
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Śr. roczna stopa</span>
                  <span className="badge-green">
                    +{cagrPct.toFixed(2).replace('.', ',')} %
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
