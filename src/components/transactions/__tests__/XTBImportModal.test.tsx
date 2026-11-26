import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XTBImportModal } from '../XTBImportModal';
import { Portfolio } from '../../../types/portfolio';

const mockPortfolios: Portfolio[] = [
  {
    id: 'port-xtb',
    name: 'Główny XTB',
    currency: 'PLN',
    includeInDashboard: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: 'port-usd',
    name: 'Portfel Dolarowy',
    currency: 'USD',
    includeInDashboard: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }
];

const mockImportXTBFile = vi.fn();

vi.mock('../../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    portfolios: mockPortfolios,
    importXTBFile: mockImportXTBFile
  })
}));

describe('XTBImportModal Component', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<XTBImportModal isOpen={false} onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog with header and portfolio select when isOpen is true', () => {
    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Import transakcji z XTB')).toBeInTheDocument();
    expect(screen.getByText('Wybierz portfel docelowy dla transakcji')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Główny XTB (PLN)')).toBeInTheDocument();
    expect(screen.getByText('Portfel Dolarowy (USD)')).toBeInTheDocument();
  });

  it('disables import button when no file is selected', () => {
    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    const importButton = screen.getByRole('button', { name: /zaimportuj raport/i });
    expect(importButton).toBeDisabled();
  });

  it('updates selected portfolio when user changes select value', async () => {
    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'port-usd' } });

    expect(select.value).toBe('port-usd');
  });

  it('displays file details when file is selected via input and enables import button', async () => {
    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    const file = new File(['dummy,content'], 'xtb_2025.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/wybierz plik z komputera/i, { selector: 'input' });

    await userEvent.upload(input, file);

    expect(screen.getByText('xtb_2025.csv')).toBeInTheDocument();
    const importButton = screen.getByRole('button', { name: /zaimportuj raport/i });
    expect(importButton).not.toBeDisabled();
  });

  it('allows removing selected file', async () => {
    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    const file = new File(['dummy,content'], 'xtb_delete_me.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/wybierz plik z komputera/i, { selector: 'input' });

    await userEvent.upload(input, file);
    expect(screen.getByText('xtb_delete_me.csv')).toBeInTheDocument();

    const deleteFileBtn = screen.getByRole('button', { name: /usuń/i });
    await userEvent.click(deleteFileBtn);

    expect(screen.queryByText('xtb_delete_me.csv')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zaimportuj raport/i })).toBeDisabled();
  });

  it('handles drag and drop of file', () => {
    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    const dropArea = screen.getByText(/przeciągnij i upuść raport z xtb/i).closest('div')!;
    const file = new File(['csv content'], 'dropped_report.csv', { type: 'text/csv' });

    fireEvent.drop(dropArea, {
      dataTransfer: {
        files: [file]
      }
    });

    expect(screen.getByText('dropped_report.csv')).toBeInTheDocument();
  });

  it('calls importXTBFile and displays success status message', async () => {
    mockImportXTBFile.mockResolvedValueOnce({
      success: true,
      count: 5,
      message: 'Pomyślnie zaimportowano 5 operacji z raportu XTB!'
    });

    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    const file = new File(['csv content'], 'report.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/wybierz plik z komputera/i, { selector: 'input' });
    await userEvent.upload(input, file);

    const importButton = screen.getByRole('button', { name: /zaimportuj raport/i });
    await userEvent.click(importButton);

    expect(mockImportXTBFile).toHaveBeenCalledWith(file, 'port-xtb');
    await waitFor(() => {
      expect(screen.getByText('Pomyślnie zaimportowano 5 operacji z raportu XTB!')).toBeInTheDocument();
    });
  });

  it('displays error status message when import fails', async () => {
    mockImportXTBFile.mockResolvedValueOnce({
      success: false,
      count: 0,
      message: 'Plik nie zawierał żadnych rozpoznanych transakcji.'
    });

    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    const file = new File(['empty content'], 'invalid.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/wybierz plik z komputera/i, { selector: 'input' });
    await userEvent.upload(input, file);

    const importButton = screen.getByRole('button', { name: /zaimportuj raport/i });
    await userEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Plik nie zawierał żadnych rozpoznanych transakcji.')).toBeInTheDocument();
    });
  });

  it('triggers onClose when close button or modal overlay is clicked', async () => {
    render(<XTBImportModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: /zamknij/i });
    await userEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
