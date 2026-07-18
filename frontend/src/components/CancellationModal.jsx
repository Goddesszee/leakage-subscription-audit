import React, { useEffect, useState } from 'react';
import './CancellationModal.css';

export default function CancellationModal({ subscription, apiBase, onClose }) {
  const [status, setStatus] = useState('loading'); // loading | done | error
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchDraft() {
      try {
        const response = await fetch(`${apiBase}/api/draft-cancellation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchant: subscription.merchant,
            amount: subscription.amount,
            currency: subscription.currency,
            frequency: subscription.frequency
          })
        });

        if (!response.ok) throw new Error('Failed to draft cancellation.');
        const data = await response.json();
        if (!cancelled) {
          setDraft(data);
          setStatus('done');
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus('error');
      }
    }

    fetchDraft();
    return () => { cancelled = true; };
  }, [subscription, apiBase]);

  function handleCopy() {
    if (!draft) return;
    const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cancel {subscription.merchant}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {status === 'loading' && <p className="modal-status">Drafting your cancellation message…</p>}
        {status === 'error' && <p className="modal-status modal-error">Could not draft a message. Try again.</p>}

        {status === 'done' && draft && (
          <>
            <div className="modal-field">
              <span className="modal-field-label">Subject</span>
              <p className="modal-subject">{draft.subject}</p>
            </div>
            <div className="modal-field">
              <span className="modal-field-label">Body</span>
              <pre className="modal-body-text">{draft.body}</pre>
            </div>
            <button className="btn-primary" onClick={handleCopy}>
              {copied ? 'Copied ✓' : 'Copy message'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
