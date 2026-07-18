import React, { useState, useRef } from 'react';
import './UploadForm.css';

const SAMPLE_DATA = `2026-01-04, NETFLIX.COM, -15.49
2026-01-06, SPOTIFY USA, -10.99
2026-01-09, ADOBE CREATIVE CLOUD, -54.99
2026-02-04, NETFLIX.COM, -15.49
2026-02-06, SPOTIFY USA, -10.99
2026-02-09, ADOBE CREATIVE CLOUD, -54.99
2026-02-14, CLOUDSTORAGE PRO, -9.99
2026-03-04, NETFLIX.COM, -15.49
2026-03-06, SPOTIFY USA, -10.99
2026-03-09, ADOBE CREATIVE CLOUD, -54.99
2026-03-14, CLOUDSTORAGE PRO, -9.99
2026-03-22, MERIDIAN FITNESS APP, -12.00
2026-04-04, NETFLIX.COM, -15.49
2026-04-06, SPOTIFY USA, -10.99
2026-04-09, ADOBE CREATIVE CLOUD, -54.99
2026-04-14, CLOUDSTORAGE PRO, -9.99
2026-04-22, MERIDIAN FITNESS APP, -12.00
2026-05-04, NETFLIX.COM, -15.49
2026-05-09, ADOBE CREATIVE CLOUD, -54.99
2026-05-14, CLOUDSTORAGE PRO, -9.99
2026-05-22, MERIDIAN FITNESS APP, -12.00
2026-06-04, NETFLIX.COM, -15.49
2026-06-09, ADOBE CREATIVE CLOUD, -54.99
2026-06-14, CLOUDSTORAGE PRO, -9.99`;

export default function UploadForm({ onAnalyze, loading, errorMessage }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileSelect(selectedFile) {
    if (!selectedFile) return;
    setFile(selectedFile);
    setText('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file && !text.trim()) return;
    onAnalyze({ text: text.trim(), file });
  }

  function loadSample() {
    setFile(null);
    setText(SAMPLE_DATA);
  }

  return (
    <section className="upload-panel">
      <h1 className="upload-title">Statement in. Leaks out.</h1>
      <p className="upload-sub">
        Paste your recent transactions, or drop a CSV export. Leakage reads the pattern of
        repeat charges and tells you which ones are quietly costing you money.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className={`dropzone ${dragOver ? 'dropzone-active' : ''} ${file ? 'dropzone-filled' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            hidden
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
          {file ? (
            <span className="mono">{file.name} — ready to scan</span>
          ) : (
            <span>Drop a .csv or .txt statement here, or click to browse</span>
          )}
        </div>

        <div className="divider">
          <span>or paste transactions directly</span>
        </div>

        <textarea
          className="mono transaction-textarea"
          placeholder={'2026-06-04, NETFLIX.COM, -15.49\n2026-06-06, SPOTIFY USA, -10.99\n...'}
          value={text}
          onChange={(e) => { setText(e.target.value); if (e.target.value) setFile(null); }}
          rows={8}
        />

        <div className="upload-actions">
          <button type="button" className="btn-ghost" onClick={loadSample}>
            Use sample statement
          </button>
          <button type="submit" className="btn-primary" disabled={loading || (!file && !text.trim())}>
            {loading ? 'Scanning statement…' : 'Find the leaks'}
          </button>
        </div>

        {errorMessage && <p className="upload-error">{errorMessage}</p>}
      </form>
    </section>
  );
}
