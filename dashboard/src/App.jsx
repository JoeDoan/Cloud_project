import React, { useState, useEffect, useCallback } from 'react';
import LiveFeed from './components/LiveFeed';
import AttackTypeChart from './components/AttackTypeChart';
import BlockedPieChart from './components/BlockedPieChart';
import SecurityScore from './components/SecurityScore';

// ── AWS Config ────────────────────────────────────────────────────────────────
const API_URL = process.env.REACT_APP_API_URL
  || 'https://2y68q1dt27.execute-api.us-east-2.amazonaws.com/prod';

// ── Fetch recent findings from your API Gateway → Lambda → DynamoDB ───────────
async function fetchFindings() {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/findings`);
    const data = await res.json();
    return data.findings || [];
  } catch (e) {
    console.error('[fetchFindings]', e);
    return [];
  }
}

export default function App() {
  const [findings, setFindings]     = useState([]);
  const [secScore, setSecScore]     = useState(87);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive]         = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchFindings();
    setFindings(data.slice(0, 100)); // keep last 100
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    refresh();
    if (!isLive) return;
    const interval = setInterval(refresh, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [refresh, isLive]);

  return (
    <div style={styles.root}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🔐 SQL Injection Detection Dashboard</h1>
          <p style={styles.subtitle}>Real-time security monitoring — AWS WAF + Lambda + DynamoDB</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.livePill} onClick={() => setIsLive(l => !l)}>
            <span style={{ ...styles.liveDot, background: isLive ? '#22c55e' : '#64748b' }} />
            {isLive ? 'LIVE' : 'PAUSED'}
          </div>
          <span style={styles.lastUpdated}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </header>

      {/* ── Summary KPI Bar ── */}
      <div style={styles.kpiRow}>
        {[
          { label: 'Total Detections', value: findings.length,                             color: '#3b82f6' },
          { label: 'Critical',         value: findings.filter(f=>f.severity==='CRITICAL').length, color: '#ef4444' },
          { label: 'High',             value: findings.filter(f=>f.severity==='HIGH').length,     color: '#f97316' },
          { label: 'Blocked',          value: findings.filter(f=>f.waf_action==='BLOCK').length,  color: '#a855f7' },
        ].map(kpi => (
          <div key={kpi.label} style={styles.kpiCard}>
            <span style={{ ...styles.kpiNum, color: kpi.color }}>{kpi.value}</span>
            <span style={styles.kpiLabel}>{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* ── 4-chart Grid ── */}
      <div style={styles.grid}>
        <LiveFeed          findings={findings} />
        <AttackTypeChart   findings={findings} />
        <BlockedPieChart   findings={findings} />
        <SecurityScore     findings={findings} score={secScore} />
      </div>
    </div>
  );
}

const styles = {
  root: { maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
  },
  title:   { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitle:{ fontSize: '13px', color: '#64748b' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 },
  livePill: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '6px 14px',
    fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em',
    cursor: 'pointer', userSelect: 'none', color: '#e2e8f0',
  },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%' },
  lastUpdated: { fontSize: '12px', color: '#64748b' },

  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  kpiCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '20px', textAlign: 'center',
  },
  kpiNum:   { display: 'block', fontSize: '36px', fontWeight: '700', lineHeight: 1 },
  kpiLabel: { display: 'block', fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
};
