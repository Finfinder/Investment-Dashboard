import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Portfolio, Currency } from '../../types/portfolio';
import { Plus, Trash2, Edit2, FolderPlus, Check } from 'lucide-react';

interface PortfolioManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editPortfolioId?: string;
}

export const PortfolioManagerModal: React.FC<PortfolioManagerModalProps> = ({
  isOpen,
  onClose,
  editPortfolioId
}) => {
  const { portfolios, addPortfolio, updatePortfolio, deletePortfolio } = usePortfolio();

  const [name, setName] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('PLN');
  const [includeInDashboard, setIncludeInDashboard] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [color, setColor] = useState<string>('#3b82f6');
  const [editingId, setEditingId] = useState<string | null>(editPortfolioId || null);

  if (!isOpen) return null;

  const handleStartEdit = (p: Portfolio) => {
    setEditingId(p.id);
    setName(p.name);
    setCurrency(p.currency);
    setIncludeInDashboard(p.includeInDashboard);
    setDescription(p.description || '');
    setColor(p.color || '#3b82f6');
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setCurrency('PLN');
    setIncludeInDashboard(true);
    setDescription('');
    setColor('#3b82f6');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Podaj nazwę portfela!');
      return;
    }

    if (editingId) {
      await updatePortfolio(editingId, {
        name,
        currency,
        includeInDashboard,
        description,
        color
      });
    } else {
      await addPortfolio({
        name,
        currency,
        includeInDashboard,
        description,
        color
      });
    }

    handleResetForm();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#091124', borderColor: '#172445', maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderPlus size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              Zarządzanie Portfelami
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div className="modal-body">
          {/* Form to Add or Edit */}
          <form onSubmit={handleSave} style={{ backgroundColor: '#0b1429', border: '1px solid #1a2847', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.85rem' }}>
              {editingId ? 'Edytuj portfel' : 'Dodaj nowy portfel'}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }} className="form-group">
              <div>
                <label className="form-label">Nazwa portfela</label>
                <input
                  type="text"
                  placeholder="np. XTB, IKE, ProPicks, Crypto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Waluta bazowa</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="form-select">
                  <option value="PLN">PLN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeInDashboard}
                  onChange={(e) => setIncludeInDashboard(e.target.checked)}
                />
                Uwzględnij w podsumowaniu w kokpicie (<strong style={{ color: '#38bdf8' }}>∑</strong>)
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Opis / Uwagi (Opcjonalnie)</label>
              <input
                type="text"
                placeholder="np. Portfel akcji dywidendowych"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              {editingId && (
                <button type="button" onClick={handleResetForm} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>Anuluj edycję</button>
              )}
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                {editingId ? 'Zapisz zmiany' : 'Dodaj portfel'}
              </button>
            </div>
          </form>

          {/* List of Existing Portfolios */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
            Lista Twoich portfeli ({portfolios.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {portfolios.map(p => (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#0b1429',
                  border: '1px solid #1a2847',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>({p.currency})</span>
                    {p.includeInDashboard && (
                      <span style={{ backgroundColor: '#1e293b', color: '#38bdf8', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>∑ Kokpit</span>
                    )}
                  </div>
                  {p.description && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{p.description}</div>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => handleStartEdit(p)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <Edit2 size={13} /> Edytuj
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Czy na pewno chcesz usunąć portfel "${p.name}" wraz ze wszystkimi jego transakcjami?`)) {
                        deletePortfolio(p.id);
                      }
                    }}
                    className="btn btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 0 0 0', borderTop: 'none' }}>
            <button type="button" onClick={onClose} className="btn btn-primary">Zamknij</button>
          </div>
        </div>
      </div>
    </div>
  );
};
