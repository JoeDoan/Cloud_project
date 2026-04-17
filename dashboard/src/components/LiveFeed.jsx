import React, { useEffect, useState } from 'react';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH:     '#f97316',
  MEDIUM:   '#eab308',
  LOW:      '#22c55e',
  NONE:     '#64748b',
};

export default function LiveFeed({ findings }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>⚡ Live Attack Feed</h2>
      <div style={styles.feedList}>
        {findings.length === 0 ? (
          <p style={styles.empty}>No detections yet. Waiting for attack traffic...</p>
        ) : (
          findings.map((f, i) => (
            <div key={i} style={styles.feedItem}>
              <span style={{ ...styles.badge, background: SEVERITY_COLORS[f.severity] }}>
                {f.severity}
              </span>
              <div style={styles.feedDetails}>
                <span style={styles.feedTime}>{new Date(f.timestamp).toLocaleTimeString()}</span>
                <span style={styles.feedIp}>{f.source_ip}</span>
                <span style={styles.feedQuery}>{f.query?.substring(0, 60)}...</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    height: '340px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  feedList: {
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  feedItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px',
    background: 'var(--bg-card-alt)',
    borderRadius: '8px',
    borderLeft: '3px solid var(--accent-blue)',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 7px',
    borderRadius: '4px',
    color: '#fff',
    flexShrink: 0,
    marginTop: '2px',
  },
  feedDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  feedTime:  { fontSize: '11px', color: '#64748b' },
  feedIp:    { fontSize: '12px', fontWeight: '600', color: '#e2e8f0' },
  feedQuery: { fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  empty:     { color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '40px' },
};
