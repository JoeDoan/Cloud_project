import React from 'react';

// Severity color map
const SCORE_COLOR = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  return '#ef4444';
};

export default function SecurityScore({ score, findings }) {
  const critical = findings.filter(f => f.severity === 'CRITICAL').length;
  const high     = findings.filter(f => f.severity === 'HIGH').length;
  const medium   = findings.filter(f => f.severity === 'MEDIUM').length;
  const color    = SCORE_COLOR(score);

  // Circular SVG progress ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>🏆 Security Hub Score</h2>
      <div style={styles.row}>
        <div style={styles.ring}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle
              cx="65" cy="65" r={radius} fill="none"
              stroke={color} strokeWidth="10"
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
            <text x="65" y="60" textAnchor="middle" fill={color} fontSize="22" fontWeight="700">{score}%</text>
            <text x="65" y="80" textAnchor="middle" fill="#64748b" fontSize="11">CIS Benchmark</text>
          </svg>
        </div>
        <div style={styles.stats}>
          <div style={styles.statRow}>
            <span style={{ ...styles.dot, background: '#ef4444' }} />
            <span style={styles.statLabel}>Critical</span>
            <span style={styles.statNum}>{critical}</span>
          </div>
          <div style={styles.statRow}>
            <span style={{ ...styles.dot, background: '#f97316' }} />
            <span style={styles.statLabel}>High</span>
            <span style={styles.statNum}>{high}</span>
          </div>
          <div style={styles.statRow}>
            <span style={{ ...styles.dot, background: '#eab308' }} />
            <span style={styles.statLabel}>Medium</span>
            <span style={styles.statNum}>{medium}</span>
          </div>
          <div style={styles.statRow}>
            <span style={{ ...styles.dot, background: '#3b82f6' }} />
            <span style={styles.statLabel}>Total Events</span>
            <span style={styles.statNum}>{findings.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '20px', height: '340px',
    display: 'flex', flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '14px', fontWeight: '600', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px',
  },
  row:     { display: 'flex', alignItems: 'center', gap: '24px', flex: 1 },
  ring:    { flexShrink: 0 },
  stats:   { display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 },
  statRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  dot:     { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  statLabel: { flex: 1, fontSize: '13px', color: '#94a3b8' },
  statNum:   { fontSize: '16px', fontWeight: '700', color: '#e2e8f0' },
};
