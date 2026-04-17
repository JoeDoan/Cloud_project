import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BlockedPieChart({ findings }) {
  const blocked = findings.filter(f => f.waf_action === 'BLOCK').length;
  const allowed = findings.filter(f => f.waf_action !== 'BLOCK').length;
  const total = findings.length || 1;

  const data = {
    labels: ['Blocked', 'Allowed'],
    datasets: [{
      data: [blocked, allowed],
      backgroundColor: ['#ef4444', '#22c55e'],
      borderColor: ['#7f1d1d', '#14532d'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#94a3b8' },
    },
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>🛡️ Blocked vs Allowed</h2>
      <div style={styles.centerStat}>
        <span style={styles.bigNum}>{Math.round((blocked / total) * 100)}%</span>
        <span style={styles.subLabel}>Blocked</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Doughnut data={data} options={options} />
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
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
  },
  centerStat: { textAlign: 'center', marginBottom: '8px' },
  bigNum: { fontSize: '36px', fontWeight: '700', color: '#ef4444', display: 'block' },
  subLabel: { fontSize: '12px', color: '#64748b' },
};
