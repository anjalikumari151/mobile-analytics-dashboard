import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import api from '../../utils/api'
import { useFilter } from '../../context/FilterContext'
import KpiCard from '../../components/KpiCard'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

interface CrashTrend { date: string; crash_rate: number; crashes: number }
interface ScreenLoad { screen: string; p50: number; p90: number; count: number }
interface PerfData {
  crash_rate_trend: CrashTrend[]
  avg_crash_rate: number
  total_crashes: number
  screen_load_times: ScreenLoad[]
}

const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }

export default function PerformanceSection() {
  const { days } = useFilter()
  const [data, setData] = useState<PerfData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/metrics/performance?days=${days}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <p style={styles.loading}>Loading performance data…</p>
  if (!data) return <p style={styles.error}>Failed to load data.</p>

  const crashData = {
    labels: data.crash_rate_trend.map((d) => d.date),
    datasets: [{
      label: 'Crash Rate (%)',
      data: data.crash_rate_trend.map((d) => d.crash_rate),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.1)',
      tension: 0.3,
      fill: true,
    }],
  }

  const topScreens = data.screen_load_times.slice(0, 8)
  const loadData = {
    labels: topScreens.map((s) => s.screen),
    datasets: [
      { label: 'P50 (ms)', data: topScreens.map((s) => s.p50), backgroundColor: '#3b82d4' },
      { label: 'P90 (ms)', data: topScreens.map((s) => s.p90), backgroundColor: '#ef4444' },
    ],
  }

  return (
    <div>
      <h2 style={styles.heading}>⚡ Performance Metrics</h2>
      <div style={styles.kpiRow}>
        <KpiCard label="Avg Crash Rate" value={`${data.avg_crash_rate}%`} sub="Last period" color="#ef4444" />
        <KpiCard label="Total Crashes" value={data.total_crashes} color="#f59e0b" />
      </div>
      <div style={styles.chartRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Crash Rate Trend</h3>
          <div style={{ height: 220 }}>
            <Line data={crashData} options={chartOpts} />
          </div>
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Screen Load Times — P50 vs P90 (ms)</h3>
          <div style={{ height: 220 }}>
            <Bar data={loadData} options={chartOpts} />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2328' },
  kpiRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  chartBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 },
  chartTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1f2328' },
  loading: { color: '#57606a', padding: 24 },
  error: { color: '#c0392b', padding: 24 },
}
