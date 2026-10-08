interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export default function KpiCard({ label, value, sub, color = '#3b82d4' }: KpiCardProps) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.accent, background: color }} />
      <div style={styles.body}>
        <div style={styles.label}>{label}</div>
        <div style={styles.value}>{value}</div>
        {sub && <div style={styles.sub}>{sub}</div>}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    display: 'flex',
    overflow: 'hidden',
    minWidth: 160,
    flex: 1,
  },
  accent: { width: 4, flexShrink: 0 },
  body: { padding: '16px 18px' },
  label: { fontSize: 12, color: '#57606a', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },
  value: { fontSize: 26, fontWeight: 700, color: '#1f2328' },
  sub: { fontSize: 12, color: '#57606a', marginTop: 4 },
}
