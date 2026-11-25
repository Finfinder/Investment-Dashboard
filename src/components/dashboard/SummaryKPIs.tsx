import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Info } from 'lucide-react';

export const SummaryKPIs: React.FC = () => {
  const { summaryStats } = usePortfolio();

  const formatPLN = (val: number) => {
    return val.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPct = (val: number) => {
    const prefix = val > 0 ? '+' : '';
    return `${prefix}${val.toFixed(2).replace('.', ',')} %`;
  };

  return (
    <div className="card-panel" style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
          Podsumowanie portfeli w przeliczeniu na PLN
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Wybierz datę początkową:</span>
          <select className="form-select" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem', backgroundColor: '#091020' }}>
            <option value="default">Domyślna (bazująca na ustawieniach portfeli)</option>
            <option value="1y">Ostatni rok</option>
            <option value="ytd">Od początku roku (YTD)</option>
          </select>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        backgroundColor: '#0f1b36',
        border: '1px solid #1e2e54',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        fontSize: '0.8rem',
        color: '#94a3b8'
      }}>
        <Info size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          W podsumowaniu uwzględnione są portfele, które w opcjach portfela mają włączoną opcję 
          <strong style={{ color: '#f8fafc', marginLeft: '4px', marginRight: '4px' }}>Uwzględnij w podsumowaniu w kokpicie</strong>. 
          Poniżej na liście portfeli oznaczone są ikonką <span style={{ color: '#38bdf8', fontWeight: 700 }}>∑</span>.
        </div>
      </div>

      {/* 9 Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* Card 1: Wartość */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Wartość</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
            {formatPLN(summaryStats.totalValuePLN)}
          </div>
        </div>

        {/* Card 2: Zmiana dzienna */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Zmiana dzienna</div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: summaryStats.dailyChangePercent >= 0 ? '#10b981' : '#ef4444',
            marginTop: '0.2rem'
          }}>
            {formatPct(summaryStats.dailyChangePercent)}
          </div>
        </div>

        {/* Card 3: Zysk całkowity */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Zysk całkowity</div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: summaryStats.totalProfitPLN >= 0 ? '#10b981' : '#ef4444',
            marginTop: '0.2rem'
          }}>
            {formatPLN(summaryStats.totalProfitPLN)}
          </div>
        </div>

        {/* Card 4: Stopa zwrotu */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Stopa zwrotu</div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: summaryStats.totalReturnPercent >= 0 ? '#10b981' : '#ef4444',
            marginTop: '0.2rem'
          }}>
            {formatPct(summaryStats.totalReturnPercent)}
          </div>
        </div>

        {/* Card 5: Zysk dzienny */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Zysk dzienny</div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: summaryStats.dailyProfitPLN >= 0 ? '#10b981' : '#ef4444',
            marginTop: '0.2rem'
          }}>
            {formatPLN(summaryStats.dailyProfitPLN)}
          </div>
        </div>

        {/* Card 6: Zysk bieżący */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Zysk bieżący</div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: summaryStats.currentProfitPLN >= 0 ? '#10b981' : '#ef4444',
            marginTop: '0.2rem'
          }}>
            {formatPLN(summaryStats.currentProfitPLN)}
          </div>
        </div>

        {/* Card 7: Śr. roczna stopa */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Śr. roczna stopa</div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: summaryStats.cagrPercent >= 0 ? '#10b981' : '#ef4444',
            marginTop: '0.2rem'
          }}>
            {formatPct(summaryStats.cagrPercent)}
          </div>
        </div>

        {/* Card 8: Walory wzrosty */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Walory wzrosty</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
            {summaryStats.gainersCount}
          </div>
        </div>

        {/* Card 9: Walory spadki */}
        <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2747', borderRadius: '8px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Walory spadki</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>
            {summaryStats.losersCount}
          </div>
        </div>
      </div>
    </div>
  );
};
