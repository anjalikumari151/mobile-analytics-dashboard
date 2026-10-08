import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import api from '../../utils/api'
import { useFilter } from '../../context/FilterContext'
import KpiCard from '../../components/KpiCard'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface TrendRow { date: string; delivery_rate: number; open_rate: number }
interface NotifData {
  trend: TrendRow[]
  overall_delivery_rate: number
  overall_open_rate: number
}

const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }

export default function NotificationsSection() {
  const { days } = useFilter()
  const [data, setData] = useState<NotifData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/metrics/notifications?days=${days}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <p style={styles.loading}>Loading notification data…</p>
  if (!data) return <p style={styles.error}>Failed to load data.</p>

  const trendChart = {
    labels: data.trend.map((d) => d.date),
    datasets: [
      { label: 'Delivery Rate (%)', data: data.trend.map((d) => d.delivery_rate), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3, fill: true },
      { label: 'Open Rate (%)', data: data.trend.map((d) => d.open_rate), borderColor: '#3b82d4', backgroundColor: 'rgba(59,130,212,0.1)', tension: 0.3, fill: true },
    ],
  }

  return (
    <div>
      <h2 style={styles.heading}>🔔 Notification Analytics</h2>
      <div style={styles.kpiRow}>
        <KpiCard label="Delivery Rate" value={`${data.overall_delivery_rate}%`} color="#10b981" />
        <KpiCard label="Open Rate" value={`${data.overall_open_rate}%`} color="#3b82d4" />
      </div>
      <div style={styles.chartBox}>
        <h3 style={styles.chartTitle}>Delivery & Open Rate Trend</h3>
        <div style={{ height: 260 }}>
          <Line data={trendChart} options={chartOpts} />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2328' },
  kpiRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 },
  chartBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 },
  chartTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1f2328' },
  loading: { color: '#57606a', padding: 24 },
  error: { color: '#c0392b', padding: 24 },
}
