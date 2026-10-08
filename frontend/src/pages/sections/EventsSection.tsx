import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import api from '../../utils/api'
import { useFilter } from '../../context/FilterContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface EventRow { event: string; count: number }
interface FunnelStep { step: string; count: number }
interface EventData { top_events: EventRow[]; funnel: FunnelStep[] }

const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }

export default function EventsSection() {
  const { days } = useFilter()
  const [data, setData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/metrics/events?days=${days}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <p style={styles.loading}>Loading event data…</p>
  if (!data) return <p style={styles.error}>Failed to load data.</p>

  const eventsChartData = {
    labels: data.top_events.map((e) => e.event),
    datasets: [{ label: 'Count', data: data.top_events.map((e) => e.count), backgroundColor: '#3b82d4' }],
  }

  // Funnel: compute conversion % between steps
  const funnel = data.funnel
  const maxCount = funnel[0]?.count || 1

  return (
    <div>
      <h2 style={styles.heading}>🎯 Events & Conversion Funnel</h2>
      <div style={styles.layout}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Top Events by Count</h3>
          <div style={{ height: 300 }}>
            <Bar data={eventsChartData} options={{ ...chartOpts, indexAxis: 'y' as const }} />
          </div>
        </div>

        <div style={styles.funnelBox}>
          <h3 style={styles.chartTitle}>Conversion Funnel</h3>
          <div style={styles.funnel}>
            {funnel.map((step, i) => {
              const pct = Math.round(step.count / maxCount * 100)
              const conv = i > 0
                ? Math.round(step.count / (funnel[i - 1].count || 1) * 100)
                : 100
              return (
                <div key={step.step} style={styles.funnelStep}>
                  <div style={{ ...styles.funnelBar, width: `${pct}%` }}>
                    <span style={styles.funnelLabel}>{step.step}</span>
                    <span style={styles.funnelCount}>{step.count}</span>
                  </div>
                  {i > 0 && (
                    <span style={styles.convLabel}>↓ {conv}% from previous</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2328' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  chartBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 },
  funnelBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 },
  chartTitle: { fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1f2328' },
  funnel: { display: 'flex', flexDirection: 'column', gap: 8 },
  funnelStep: { display: 'flex', flexDirection: 'column', gap: 2 },
  funnelBar: {
    background: '#3b82d4',
    color: '#fff',
    borderRadius: 4,
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    minWidth: 120,
    transition: 'width 0.3s',
  },
  funnelLabel: { fontSize: 13, fontWeight: 600 },
  funnelCount: { fontSize: 13 },
  convLabel: { fontSize: 12, color: '#57606a', marginLeft: 8 },
  loading: { color: '#57606a', padding: 24 },
  error: { color: '#c0392b', padding: 24 },
}
