import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Transaction } from '../../types/portfolio';
import { Trash2, Edit3, Plus, Minus, Info, Download, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';
import * as xlsx from 'xlsx';
import Papa from 'papaparse';

export const TransactionHistory: React.FC = () => {
  const { transactions, portfolios, deleteTransaction } = usePortfolio();

  const [dateStart, setDateStart] = useState<string>('1990-01-01');
  const [dateStop, setDateStop] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hideCashOps, setHideCashOps] = useState<boolean>(false);
  const [hidePendingDivs, setHidePendingDivs] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [timeRange, setTimeRange] = useState<string>('all');

  const filteredTransactions = transactions.filter(t => {
    const d = t.date.split('T')[0];
    if (d < dateStart || d > dateStop) return false;
    if (hideCashOps && (t.type === 'DEPOSIT' || t.type === 'WITHDRAWAL')) return false;
    if (hidePendingDivs && t.type === 'DIVIDEND' && t.comment?.includes('w drodze')) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Czy na pewno chcesz usunąć ${selectedIds.size} zaznaczonych operacji?`)) {
      for (const id of Array.from(selectedIds)) {
        await deleteTransaction(id);
      }
      setSelectedIds(new Set());
    }
  };

  const exportCSV = () => {
    const exportData = filteredTransactions.map(t => ({
      ID: t.id,
      Data: t.date,
      PortfelId: t.portfolioId,
      Typ: t.type,
      Walor: t.ticker || 'N/A',
      Nazwa: t.instrumentName || '',
      LiczbaJednostek: t.quantity,
      Cena: t.price,
      Waluta: t.currency,
      Prowizja: t.commission,
      Podatek: t.tax,
      Wartosc: t.totalValue,
      Komentarz: t.comment || ''
    }));
    const csvStr = Papa.unparse(exportData);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `historia_operacji_${dateStop}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportXLS = () => {
    const exportData = filteredTransactions.map(t => ({
      ID: t.id,
      Data: t.date,
      Typ: t.type,
      Walor: t.ticker || 'N/A',
      Liczba: t.quantity,
      Cena: t.price,
      Waluta: t.currency,
      Prowizja: t.commission,
      Podatek: t.tax,
      Wartość: t.totalValue,
      Komentarz: t.comment || ''
    }));
    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Historia Operacji');
    xlsx.writeFile(wb, `historia_operacji_${dateStop}.xlsx`);
  };

  const getPortfolioName = (id: string) => {
    return portfolios.find(p => p.id === id)?.name || 'XTB';
  };

  const formatOpName = (type: Transaction['type']) => {
    switch (type) {
      case 'BUY': return 'Kupno';
      case 'SELL': return 'Sprzedaż';
      case 'DIVIDEND': return 'Dywidenda';
      case 'DEPOSIT': return 'Wpłata automatyczna';
      case 'WITHDRAWAL': return 'Wypłata automatyczna';
      case 'TAX': return 'Podatek';
      case 'INTEREST': return 'Odsetki';
      default: return type;
    }
  };

  return (
    <div className="card-panel" style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
        Historia operacji
      </h2>

      {/* Filter Controls Bar (Matching Screenshot 8) */}
      <div style={{
        backgroundColor: '#0b1429',
        border: '1px solid #1a2847',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span className="form-label">Data start</span>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <span className="form-label">Data stop</span>
            <input
              type="date"
              value={dateStop}
              onChange={(e) => setDateStop(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <span className="form-label">Zakres czasu</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-select"
            >
              <option value="all">Wszystkie dane</option>
              <option value="7d">7d</option>
              <option value="14d">14d</option>
              <option value="30d">30d</option>
              <option value="90d">90d</option>
              <option value="1y">12m</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#f8fafc' }}>
            <input
              type="checkbox"
              checked={hideCashOps}
              onChange={(e) => setHideCashOps(e.target.checked)}
            />
            Ukryj automatycznie dodane operacje wpłat i wypłat
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#f8fafc' }}>
            <input
              type="checkbox"
              checked={hidePendingDivs}
              onChange={(e) => setHidePendingDivs(e.target.checked)}
            />
            Ukryj automatycznie dodane operacje dywidendy/odsetki w drodze
          </label>
        </div>

        <button className="btn btn-secondary" style={{ padding: '0.4rem 1.25rem', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}>
          Zastosuj
        </button>
      </div>

      {/* Transactions Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Portfel</th>
              <th>Data</th>
              <th>Operacja</th>
              <th>Konto</th>
              <th>Walor</th>
              <th>Operacje</th>
              <th>Waluta</th>
              <th>Liczba jednostek</th>
              <th>Cena</th>
              <th>Prowizja</th>
              <th>Podatek</th>
              <th>Wartość</th>
              <th>Zaznacz</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Brak operacji spełniających podane kryteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map(t => (
                <tr key={t.id} style={{ backgroundColor: selectedIds.has(t.id) ? '#122044' : 'transparent' }}>
                  <td style={{ fontWeight: 600, color: '#38bdf8' }}>{getPortfolioName(t.portfolioId)}</td>
                  <td>{t.date.replace('T', ' ').substring(0, 16)}</td>
                  <td style={{ fontWeight: 700, color: t.type === 'BUY' ? '#10b981' : t.type === 'SELL' ? '#ef4444' : '#f8fafc' }}>
                    {formatOpName(t.type)}
                  </td>
                  <td>Gotówka</td>
                  <td style={{ fontWeight: 600 }}>{t.ticker || t.instrumentName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ cursor: 'pointer', fontWeight: 800, color: '#10b981' }} title="Kupno">K</span>
                      <span style={{ cursor: 'pointer', fontWeight: 800, color: '#ef4444' }} title="Sprzedaż">S</span>
                      <span title="Usuń operację" onClick={() => deleteTransaction(t.id)} style={{ cursor: 'pointer', marginLeft: '4px', display: 'inline-flex' }}>
                        <Trash2 size={14} color="#ef4444" />
                      </span>
                    </div>
                  </td>
                  <td>{t.currency}</td>
                  <td>{t.quantity > 0 ? t.quantity : '-'}</td>
                  <td>{t.price > 0 ? t.price.toFixed(2) : '-'}</td>
                  <td>{t.commission > 0 ? t.commission.toFixed(2) : '-'}</td>
                  <td>{t.tax > 0 ? t.tax.toFixed(2) : '-'}</td>
                  <td style={{ fontWeight: 700 }}>{t.totalValue.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(t.id)}
                      onChange={() => toggleSelect(t.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Batch Operations Bottom Bar (Matching Screenshot 8) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        marginTop: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <button onClick={exportCSV} className="btn btn-secondary" style={{ backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}>
          <Download size={15} /> Eksport do csv
        </button>

        <button onClick={exportXLS} className="btn btn-secondary" style={{ backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}>
          <FileSpreadsheet size={15} /> Eksport do xls
        </button>

        <button onClick={selectAll} className="btn btn-secondary" style={{ backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}>
          Zaznacz wszystkie
        </button>

        <button onClick={deselectAll} className="btn btn-secondary" style={{ backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}>
          Odnacz wszystkie
        </button>

        <button onClick={deleteSelected} className="btn btn-danger" style={{ fontWeight: 700 }}>
          <Trash2 size={15} /> Usuń zaznaczone ({selectedIds.size})
        </button>
      </div>
    </div>
  );
};
