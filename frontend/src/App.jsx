import React, { useState } from 'react';
import UploadForm from './components/UploadForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import CancellationModal from './components/CancellationModal.jsx';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [errorMessage, setErrorMessage] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [modalSub, setModalSub] = useState(null);

  async function handleAnalyze({ text, file }) {
    setStatus('loading');
    setErrorMessage('');
    try {
      let transactionText = text;

      if (file) {
        transactionText = await file.text();
      }

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: transactionText })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      setSummary(data.summary || null);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong while analyzing your statement.');
      setStatus('error');
    }
  }

  function handleReset() {
    setStatus('idle');
    setSubscriptions([]);
    setSummary(null);
    setErrorMessage('');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <span className="brand-mark">$</span>
            <span className="brand-name">Leakage</span>
          </div>
          <p className="brand-tag">Find the subscriptions quietly draining your account.</p>
        </div>
      </header>

      <main className="app-main">
        {status !== 'done' && (
          <UploadForm
            onAnalyze={handleAnalyze}
            loading={status === 'loading'}
            errorMessage={status === 'error' ? errorMessage : ''}
          />
        )}

        {status === 'done' && (
          <Dashboard
            subscriptions={subscriptions}
            summary={summary}
            onReset={handleReset}
            onDraftCancellation={(sub) => setModalSub(sub)}
          />
        )}
      </main>

      {modalSub && (
        <CancellationModal
          subscription={modalSub}
          apiBase={API_BASE}
          onClose={() => setModalSub(null)}
        />
      )}

      <footer className="app-footer">
        <span>Built for OKX.AI Genesis Hackathon — Finance Copilot track</span>
      </footer>
    </div>
  );
}
