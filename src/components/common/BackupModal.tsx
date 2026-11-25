import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Download, Upload, ShieldCheck, CheckCircle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportBackup, importBackup } = usePortfolio();
  const [importJson, setImportJson] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    const jsonStr = await exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `investment_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatus('Pomyślnie pobrano kopię zapasową JSON!');
  };

  const handleImport = async () => {
    if (!importJson.trim()) return;
    const ok = await importBackup(importJson);
    if (ok) {
      setStatus('Pomyślnie przywrócono dane z kopii zapasowej!');
      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 1500);
    } else {
      setStatus('Błąd przywracania: Niepoprawny format pliku JSON.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#091124', borderColor: '#172445' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>Kopia Zapasowa Danych</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div className="modal-body">
          {/* Export section */}
          <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2847', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Pobierz kopię zapasową</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Pobierz plik `.json` ze wszystkimi swoimi portfelami, transakcjami i ustawieniami.
            </p>
            <button onClick={handleExport} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Download size={15} /> Pobierz plik JSON
            </button>
          </div>

          {/* Import section */}
          <div style={{ backgroundColor: '#0b1429', border: '1px solid #1a2847', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Przywróć dane z kopii</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              Wklej zawartość pliku kopii zapasowej `.json`:
            </p>
            <textarea
              rows={4}
              placeholder="Wklej kod JSON tutaj..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="form-textarea"
              style={{ marginBottom: '0.75rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
            />
            <button onClick={handleImport} disabled={!importJson.trim()} className="btn btn-success" style={{ fontSize: '0.85rem' }}>
              <Upload size={15} /> Przywróć kopię
            </button>
          </div>

          {status && (
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: status.includes('Pomyślnie') ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={16} /> {status}
            </div>
          )}

          <div className="modal-footer" style={{ padding: '1.25rem 0 0 0', borderTop: 'none' }}>
            <button onClick={onClose} className="btn btn-outline">Zamknij</button>
          </div>
        </div>
      </div>
    </div>
  );
};
