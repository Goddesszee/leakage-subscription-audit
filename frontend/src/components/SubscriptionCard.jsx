import React from 'react';
import './SubscriptionCard.css';

export default function SubscriptionCard({ subscription, onDraftCancellation }) {
  const {
    merchant,
    amount,
    currency = 'USD',
    frequency,
    occurrences,
    firstSeen,
    lastSeen,
    totalSpent,
    likelyForgotten,
    reason
  } = subscription;

  return (
    <div className={`sub-card ${likelyForgotten ? 'sub-card-flagged' : ''}`}>
      <div className="sub-card-stub" aria-hidden="true" />
      <div className="sub-card-body">
        <div className="sub-card-top">
          <div>
            <h3 className="sub-card-merchant">{merchant}</h3>
            <span className="sub-card-freq mono">{frequency}</span>
          </div>
          <div className="sub-card-amount mono">
            {currency === 'USD' ? '$' : currency + ' '}
            {Number(amount).toFixed(2)}
          </div>
        </div>

        <div className="sub-card-meta mono">
          <span>{occurrences} charges</span>
          <span className="sub-card-dot">·</span>
          <span>{firstSeen} → {lastSeen}</span>
          <span className="sub-card-dot">·</span>
          <span>${Number(totalSpent).toFixed(2)} total</span>
        </div>

        {likelyForgotten && (
          <div className="sub-card-flag">
            <span className="sub-card-flag-badge">Likely forgotten</span>
            <span className="sub-card-flag-reason">{reason}</span>
          </div>
        )}

        <button className="btn-cancel" onClick={onDraftCancellation}>
          Draft cancellation →
        </button>
      </div>
    </div>
  );
}
