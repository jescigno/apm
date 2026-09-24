import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ADMIN_TEAM_BULK_IMPORT_TEMPLATE,
  ADMIN_TEAM_BULK_IMPORT_TEMPLATE_FILENAME,
  parseTeamImportCsv,
} from '../constants/adminTeam';
import { ICON_CLOSE, ICON_DOWNLOAD } from '../constants/designSystem';

const ICON_UPLOAD = '/icons/Upload.svg';
const CSV_ACCEPT = '.csv,text/csv,application/vnd.ms-excel';

function isCsvFile(file) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function downloadImportTemplate() {
  const blob = new Blob([ADMIN_TEAM_BULK_IMPORT_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = ADMIN_TEAM_BULK_IMPORT_TEMPLATE_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AdminTeamBulkImportOverlay({ open, onClose, onImport }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const resetState = useCallback(() => {
    setFile(null);
    setRows([]);
    setError('');
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, resetState]);

  const applyFile = useCallback(async (nextFile) => {
    if (!nextFile) return;

    if (!isCsvFile(nextFile)) {
      setFile(null);
      setRows([]);
      setError('Please upload a CSV file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const text = await nextFile.text();
      const parsed = parseTeamImportCsv(text);
      if (parsed.error) {
        setFile(null);
        setRows([]);
        setError(parsed.error);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setFile(nextFile);
      setRows(parsed.rows);
      setError('');
    } catch {
      setFile(null);
      setRows([]);
      setError('Unable to read this file. Please try another CSV.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    applyFile(nextFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const nextFile = event.dataTransfer.files?.[0];
    applyFile(nextFile);
  };

  const handleImport = () => {
    if (!rows.length) return;
    onImport?.(rows);
    onClose?.();
  };

  if (!open) return null;

  const canImport = rows.length > 0;

  return createPortal(
    <div
      className="admin-team-bulk-import-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-team-bulk-import-title"
    >
      <div
        className="admin-team-bulk-import-overlay__backdrop"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose?.();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close bulk import"
      />
      <div className="admin-team-bulk-import-overlay__panel-wrap">
        <div className="admin-team-bulk-import-overlay__panel">
          <header className="admin-team-bulk-import-overlay__header">
            <h2 id="admin-team-bulk-import-title" className="admin-team-bulk-import-overlay__title">
              Bulk Import
            </h2>
            <button
              type="button"
              className="admin-team-bulk-import-overlay__close"
              onClick={onClose}
              aria-label="Close bulk import"
            >
              <img src={ICON_CLOSE} alt="" />
            </button>
          </header>

          <div className="admin-team-bulk-import-overlay__body">
            <p className="admin-team-bulk-import-overlay__description">
              Upload a CSV file to invite multiple team members at once.
            </p>

            <button
              type="button"
              className="admin-team-bulk-import-overlay__template"
              onClick={downloadImportTemplate}
            >
              <img src={ICON_DOWNLOAD} alt="" aria-hidden="true" />
              Download CSV template
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="admin-team-bulk-import-overlay__file-input"
              accept={CSV_ACCEPT}
              onChange={handleFileChange}
            />

            {file ? (
              <div className="admin-team-bulk-import-overlay__file">
                <img src={ICON_UPLOAD} alt="" aria-hidden="true" />
                <div className="admin-team-bulk-import-overlay__file-copy">
                  <p className="admin-team-bulk-import-overlay__file-name">{file.name}</p>
                  <p className="admin-team-bulk-import-overlay__file-meta">
                    {formatFileSize(file.size)}
                    {rows.length ? ` · ${rows.length} member${rows.length === 1 ? '' : 's'}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-team-bulk-import-overlay__file-remove"
                  onClick={resetState}
                  aria-label={`Remove ${file.name}`}
                >
                  <img src={ICON_CLOSE} alt="" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`admin-team-bulk-import-overlay__dropzone${dragOver ? ' admin-team-bulk-import-overlay__dropzone--active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(event) => {
                  if (event.currentTarget.contains(event.relatedTarget)) return;
                  setDragOver(false);
                }}
                onDrop={handleDrop}
              >
                <img src={ICON_UPLOAD} alt="" aria-hidden="true" />
                <span className="admin-team-bulk-import-overlay__dropzone-title">
                  Drag and drop your CSV here
                </span>
                <span className="admin-team-bulk-import-overlay__dropzone-hint">or click to browse</span>
                <span className="admin-team-bulk-import-overlay__dropzone-types">CSV files only</span>
              </button>
            )}

            {error ? <p className="admin-team-bulk-import-overlay__error">{error}</p> : null}
          </div>

          <footer className="admin-team-bulk-import-overlay__footer">
            <button type="button" className="admin-team-btn admin-team-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="admin-team-btn admin-team-btn--primary"
              onClick={handleImport}
              disabled={!canImport}
            >
              Import
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body
  );
}
