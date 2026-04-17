import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AttackTypeChart({ findings }) {
  const counts = findings.reduce((acc, f) => {
    const patterns = JSON.parse(f.patterns || '[]');
    patterns.forEach(p => { acc[p.pattern] = (acc[p.pattern] || 0) + 1; });
    return acc;
  }, {});

  const data = {
    labels: Object.keys(counts).map(k => k.replace(/_/g, ' ')),
    datasets: [{
      label: 'Attack Count',
      data: Object.values(counts),
      backgroundColor: ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#14b8a6'],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#94a3b8' },
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
    },
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>📊 Attack Type Breakdown</h2>
      <div style={{ flex: 1, minHeight: 0 }}>
        {Object.keys(counts).length === 0
          ? <p style={styles.empty}>No data yet</p>
          : <Bar data={data} options={options} />}
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
  empty: { color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '40px' },
};
