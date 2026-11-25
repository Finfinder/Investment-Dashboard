import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioCalculations } from '../../services/analytics/portfolioCalculations';
import { AssetCategory, HoldingPosition } from '../../types/portfolio';
import * as xlsx from 'xlsx';
import Papa from 'papaparse';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Minus, 
  Trash2, 
  Info, 
  Bell, 
  MessageSquare, 
  Download, 
  FileSpreadsheet, 
  FileCode 
} from 'lucide-react';

interface HoldingsTableProps {
  onQuickBuy: (ticker: string, category: AssetCategory) => void;
  onQuickSell: (ticker: string, category: AssetCategory) => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ onQuickBuy, onQuickSell }) => {
  const { holdings, transactions } = usePortfolio();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>('PLN');
  const [calcFromDate, setCalcFromDate] = useState<string>('2025-12-01');
  const [calcToDate, setCalcToDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const grouped = PortfolioCalculations.groupHoldings(holdings);

  const toggleGroup = (category: string) => {
    setCollapsedGroups(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const totalPortfolioValue = holdings.reduce((s, h) => s + h.totalValuePLN, 0);
  const totalCost = holdings.reduce((s, h) => s + h.totalCostPLN, 0);
  const totalProfit = totalPortfolioValue - totalCost;
  const totalReturnPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const totalDailyProfit = holdings.reduce((s, h) => s + h.dailyProfitPLN, 0);
  const totalDailyChangePct = totalPortfolioValue > 0 ? (totalDailyProfit / totalPortfolioValue) * 100 : 0;

  const firstTxDate = transactions.length > 0
    ? transactions.reduce((min, t) => t.date < min ? t.date : min, transactions[0].date).split('T')[0]
    : '2025-12-01';

  // Export functions
  const exportCSV = () => {
    const exportData = holdings.map(h => ({
      Walor: `${h.name} (${h.ticker})`,
      Kategoria: h.category,
      ZmianaDziennaPct: h.dailyChangePercent,
      LiczbaJednostek: h.quantity,
      SrCenaZakupuPLN: h.averageBuyPricePLN,
      CenaAktualnaPLN: h.currentPricePLN,
      DataCeny: h.currentPriceTime,
      OkresInwestycjiDni: h.investmentPeriodDays,
      WartoscWaloruPLN: h.totalValuePLN,
      UdzialPct: h.portfolioSharePercent,
      StopaZwrotuPct: h.unrealizedProfitPercent,
      ZyskPLN: h.unrealizedProfitPLN
    }));
    const csvStr = Papa.unparse(exportData);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `inwestycje_${calcToDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportXLS = () => {
    const exportData = holdings.map(h => ({
      Walor: `${h.name} (${h.ticker})`,
      Kategoria: h.category,
      'Zmiana dzienna [%]': h.dailyChangePercent,
      'Liczba jednostek': h.quantity,
      'Śr. cena zakupu [PLN]': h.averageBuyPricePLN,
      'Cena aktualna [PLN]': h.currentPricePLN,
      'Data ceny': h.currentPriceTime,
      'Okres inwestycji': h.investmentPeriodDays,
      'Wartość waloru [PLN]': h.totalValuePLN,
      'Udział [%]': h.portfolioSharePercent,
      'Stopa zwrotu [%]': h.unrealizedProfitPercent,
      'Zysk [PLN]': h.unrealizedProfitPLN
    }));
    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Inwestycje');
    xlsx.writeFile(wb, `inwestycje_${calcToDate}.xlsx`);
  };

  const exportXML = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Inwestycje data="${calcToDate}">\n`;
    holdings.forEach(h => {
      xml += `  <Walor ticker="${h.ticker}">\n`;
      xml += `    <Nazwa>${h.name}</Nazwa>\n`;
      xml += `    <Kategoria>${h.category}</Kategoria>\n`;
      xml += `    <LiczbaJednostek>${h.quantity}</LiczbaJednostek>\n`;
      xml += `    <SrCenaZakupu>${h.averageBuyPricePLN}</SrCenaZakupu>\n`;
      xml += `    <CenaAktualna>${h.currentPricePLN}</CenaAktualna>\n`;
      xml += `    <WartoscPLN>${h.totalValuePLN}</WartoscPLN>\n`;
      xml += `    <ZyskPLN>${h.unrealizedProfitPLN}</ZyskPLN>\n`;
      xml += `    <StopaZwrotuPct>${h.unrealizedProfitPercent}</StopaZwrotuPct>\n`;
      xml += `  </Walor>\n`;
    });
    xml += `</Inwestycje>`;
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `inwestycje_${calcToDate}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card-panel" style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
      {/* Table Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>Inwestycje</h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Data pierwszej operacji w portfelu: {firstTxDate}</span>
        </div>

        {/* Currency & Date Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Waluta</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
            >
              <option value="PLN">PLN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Przelicz portfel od</span>
            <input
              type="date"
              value={calcFromDate}
              onChange={(e) => setCalcFromDate(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Pokaż portfel na dzień</span>
            <input
              type="date"
              value={calcToDate}
              onChange={(e) => setCalcToDate(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Grouped Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: '220px' }}>Walor</th>
              <th style={{ width: '150px' }}>Operacje</th>
              <th>Zmiana dzienna* [%]</th>
              <th>Liczba jednostek</th>
              <th>Śr. cena zakupu [{selectedCurrency}]</th>
              <th>Cena aktualna [{selectedCurrency}]</th>
              <th>Data ceny aktualnej ***</th>
              <th>Okres inwestycji</th>
              <th>Wartość waloru [{selectedCurrency}]</th>
              <th>Udział w wartości portfela [%]</th>
              <th>Stopa zwrotu [%]</th>
              <th>Zysk [{selectedCurrency}]</th>
            </tr>
          </thead>
          <tbody>
            {/* Total Portfolio Header Row */}
            <tr style={{ backgroundColor: '#0f1b36', fontWeight: 800 }}>
              <td style={{ color: '#38bdf8' }}>Cały Portfel</td>
              <td></td>
              <td className={totalDailyChangePct >= 0 ? 'text-positive' : 'text-negative'}>
                {totalDailyChangePct >= 0 ? '+' : ''}{totalDailyChangePct.toFixed(2)} %
              </td>
              <td>
                {holdings.reduce((s, h) => s + h.quantity, 0).toFixed(2)} <span style={{ color: '#f59e0b' }}>i</span>
              </td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>{totalPortfolioValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</td>
              <td>100.00 %</td>
              <td className={totalReturnPct >= 0 ? 'text-positive' : 'text-negative'}>
                {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)} %
              </td>
              <td className={totalProfit >= 0 ? 'text-positive' : 'text-negative'}>
                {totalProfit.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
              </td>
            </tr>

            {/* Asset Groups */}
            {grouped.map(group => {
              const isCollapsed = collapsedGroups[group.category];
              return (
                <React.Fragment key={group.category}>
                  {/* Category Summary Row */}
                  <tr
                    onClick={() => toggleGroup(group.category)}
                    style={{
                      backgroundColor: '#122044',
                      cursor: 'pointer',
                      fontWeight: 700,
                      borderTop: '2px solid #1a2847'
                    }}
                  >
                    <td colSpan={12} style={{ color: '#f8fafc' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        <strong style={{ color: '#38bdf8' }}>{group.category} ({group.assetCount})</strong>, 
                        wartość: <span style={{ color: '#f8fafc' }}>{group.totalValuePLN.toLocaleString('pl-PL')}</span>, 
                        zysk: <span style={group.totalProfitPLN >= 0 ? { color: '#10b981' } : { color: '#ef4444' }}>{group.totalProfitPLN.toLocaleString('pl-PL')}</span>, 
                        wartość zakupu: {group.totalCostPLN.toLocaleString('pl-PL')}, 
                        zysk dzienny: <span style={group.totalDailyProfitPLN >= 0 ? { color: '#10b981' } : { color: '#ef4444' }}>{group.totalDailyProfitPLN.toLocaleString('pl-PL')}</span>, 
                        zwrot: <span style={group.averageReturnPercent >= 0 ? { color: '#10b981' } : { color: '#ef4444' }}>{group.averageReturnPercent}%</span>, 
                        zmiana dzienna: <span style={group.averageDailyChangePercent >= 0 ? { color: '#10b981' } : { color: '#ef4444' }}>{group.averageDailyChangePercent}%</span>, 
                        udział: {group.portfolioSharePercent}%
                      </span>
                    </td>
                  </tr>

                  {/* Individual Holding Rows */}
                  {!isCollapsed && group.holdings.map(h => (
                    <tr key={h.ticker} style={{ backgroundColor: '#091020' }}>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {h.name} ({h.ticker})
                      </td>
                      {/* Action Icons */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => onQuickBuy(h.ticker, h.category)}
                            title="Szybkie Kupno (K)"
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#10b981', padding: '0.2rem 0.35rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem' }}
                          >
                            K
                          </button>
                          <button
                            onClick={() => onQuickSell(h.ticker, h.category)}
                            title="Szybka Sprzedaż (S)"
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#ef4444', padding: '0.2rem 0.35rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem' }}
                          >
                            S
                          </button>
                          <span title="Informacje o walorze"><Info size={14} color="#94a3b8" style={{ cursor: 'pointer' }} /></span>
                          <span title="Ustaw alert cenowy"><Bell size={14} color="#94a3b8" style={{ cursor: 'pointer' }} /></span>
                          <span title="Komentarz"><MessageSquare size={14} color="#94a3b8" style={{ cursor: 'pointer' }} /></span>
                        </div>
                      </td>

                      <td className={h.dailyChangePercent >= 0 ? 'text-positive' : 'text-negative'}>
                        {h.dailyChangePercent >= 0 ? '▲ ' : '▼ '}
                        {Math.abs(h.dailyChangePercent).toFixed(2)} %
                      </td>
                      <td>{h.quantity}</td>
                      <td>{h.averageBuyPricePLN.toFixed(2)}</td>
                      <td>{h.currentPricePLN.toFixed(2)}</td>
                      <td>{h.currentPriceTime}</td>
                      <td>{h.investmentPeriodDays} dni</td>
                      <td>{h.totalValuePLN.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</td>
                      <td>{h.portfolioSharePercent} %</td>
                      <td className={h.unrealizedProfitPercent >= 0 ? 'text-positive' : 'text-negative'}>
                        {h.unrealizedProfitPercent >= 0 ? '▲ ' : '▼ '}
                        {Math.abs(h.unrealizedProfitPercent).toFixed(2)} %
                      </td>
                      <td className={h.unrealizedProfitPLN >= 0 ? 'text-positive' : 'text-negative'} style={{ fontWeight: 700 }}>
                        {h.unrealizedProfitPLN.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Bottom Total Row */}
            <tr style={{ backgroundColor: '#091020', fontWeight: 800, borderTop: '2px solid #1a2847' }}>
              <td>Razem ({holdings.length})</td>
              <td></td>
              <td className={totalDailyChangePct >= 0 ? 'text-positive' : 'text-negative'}>
                {totalDailyChangePct >= 0 ? '+' : ''}{totalDailyChangePct.toFixed(2)} %
              </td>
              <td>---</td>
              <td>---</td>
              <td>---</td>
              <td>---</td>
              <td>---</td>
              <td>{totalPortfolioValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</td>
              <td>---</td>
              <td className={totalReturnPct >= 0 ? 'text-positive' : 'text-negative'}>
                {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)} %
              </td>
              <td className={totalProfit >= 0 ? 'text-positive' : 'text-negative'}>
                {totalProfit.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Export Buttons Bar (Matching Screenshot 1 bottom bar) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={exportCSV}
          className="btn btn-secondary"
          style={{ minWidth: '180px', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}
        >
          <Download size={16} /> Eksport do csv
        </button>

        <button
          onClick={exportXLS}
          className="btn btn-secondary"
          style={{ minWidth: '180px', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}
        >
          <FileSpreadsheet size={16} /> Eksport do xls
        </button>

        <button
          onClick={exportXML}
          className="btn btn-secondary"
          style={{ minWidth: '180px', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}
        >
          <FileCode size={16} /> Eksport do xml
        </button>
      </div>
    </div>
  );
};
