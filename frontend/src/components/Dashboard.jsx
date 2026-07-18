import React from 'react';
import SubscriptionCard from './SubscriptionCard.jsx';
import './Dashboard.css';

export default function Dashboard({ subscriptions, summary, onReset, onDraftCancellation }) {
  const sorted = [...subscriptions].sort((a, b) => {
    if (a.likelyForgotten !== b.likelyForgotten) return a.likelyForgotten ? -1 : 1;
    return (b.amount || 0) - (a.amount || 0);
  });

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Scan results</h2>
          <p className="dashboard-sub">
            {summary?.count ?? 0} recurring charge{summary?.count === 1 ? '' : 's'} found ·{' '}
            {summary?.forgottenCount ?? 0} flagged as likely forgotten
          </p>
        </div>
        <button className="btn-ghost" onClick={onReset}>Scan another statement</button>
      </div>

      <div className="summary-strip">
        <div className="summary-stat">
          <span className="summary-label">Est. monthly spend</span>
          <span className="summary-value mono">${summary?.estimatedMonthlySpend?.toFixed(2) ?? '0.00'}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Est. annual spend</span>
          <span className="summary-value mono">
            ${((summary?.estimatedMonthlySpend ?? 0) * 12).toFixed(2)}
          </span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Likely forgotten</span>
          <span className="summary-value mono amber-text">{summary?.forgottenCount ?? 0}</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>No recurring charges detected in this statement.</p>
          <p className="empty-state-sub">Try a longer statement covering at least two or three months.</p>
        </div>
      ) : (
        <div className="subscription-list">
          {sorted.map((sub, idx) => (
            <SubscriptionCard
              key={`${sub.merchant}-${idx}`}
              subscription={sub}
              onDraftCancellation={() => onDraftCancellation(sub)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
