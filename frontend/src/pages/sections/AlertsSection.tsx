import { useEffect, useState } from 'react'
import api from '../../utils/api'

interface AlertItem {
  id: number
  metric_name: string
  operator: string
  threshold: number
  current_value: number
  severity: string
  message: string
}

export default function AlertsSection() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/metrics/alerts')
      .then((r) => setAlerts(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={styles.loading}>Evaluating alerts…</p>

  return (
    <div>
      <h2 style={styles.heading}>🚨 Rule-based Alerts</h2>
      {alerts.length === 0 ? (
        <div style={styles.allGood}>
          <span style={{ fontSize: 32 }}>✅</span>
          <p>All metrics are within thresholds. No alerts triggered.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {alerts.map((a) => (
            <div key={a.id} style={{ ...styles.alertCard, ...styles[a.severity] }}>
              <div style={styles.alertHeader}>
                <span style={styles.metricName}>{a.metric_name.replace(/_/g, ' ').toUpperCase()}</span>
                <span style={{ ...styles.badge, ...styles[`badge_${a.severity}`] }}>{a.severity.toUpperCase()}</span>
              </div>
              <p style={styles.alertMsg}>{a.message}</p>
              <div style={styles.alertMeta}>
                <span>Current: <strong>{a.current_value}</strong></span>
                <span>Threshold: <strong>{a.threshold}</strong></span>
                <span>Rule: <strong>{a.operator === 'gt' ? 'above' : 'below'} threshold</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2328' },
  allGood: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 40,
    textAlign: 'center',
    color: '#57606a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  alertCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '14px 18px',
  },
  critical: { borderLeft: '4px solid #ef4444' },
  warning: { borderLeft: '4px solid #f59e0b' },
  alertHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  metricName: { fontWeight: 700, fontSize: 14, color: '#1f2328' },
  badge: { padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  badge_critical: { background: '#fee2e2', color: '#b91c1c' },
  badge_warning: { background: '#fef3c7', color: '#92400e' },
  alertMsg: { fontSize: 13, color: '#57606a', marginBottom: 8 },
  alertMeta: { display: 'flex', gap: 20, fontSize: 12, color: '#57606a' },
  loading: { color: '#57606a', padding: 24 },
}
