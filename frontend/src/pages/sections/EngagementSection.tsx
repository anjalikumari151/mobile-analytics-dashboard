import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import api from '../../utils/api'
import { useFilter } from '../../context/FilterContext'
import KpiCard from '../../components/KpiCard'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface DailyCount { date: string; count: number }
interface NewVsReturning { date: string; new: number; returning: number }
interface EngagementData {
  dau: number; wau: number; mau: number
  avg_session_duration: number; total_sessions: number
  new_users: number; returning_users: number
  dau_trend: DailyCount[]
  new_vs_returning: NewVsReturning[]
}
interface RetentionData { day1: number; day7: number; day30: number }

const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }

export default function EngagementSection() {
  const { days } = useFilter()
  const [eng, setEng] = useState<EngagementData | null>(null)
  const [ret, setRet] = useState<RetentionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/metrics/engagement?days=${days}`),
      api.get('/metrics/retention'),
    ]).then(([e, r]) => {
      setEng(e.data)
      setRet(r.data)
    }).finally(() => setLoading(false))
  }, [days])

  if (loading) return <p style={styles.loading}>Loading engagement data…</p>
  if (!eng) return <p style={styles.error}>Failed to load data.</p>

  const dauData = {
    labels: eng.dau_trend.map((d) => d.date),
    datasets: [{ label: 'DAU', data: eng.dau_trend.map((d) => d.count), borderColor: '#3b82d4', backgroundColor: 'rgba(59,130,212,0.1)', tension: 0.3, fill: true }],
  }

  const nvr = eng.new_vs_returning
  const nvrData = {
    labels: nvr.map((d) => d.date),
    datasets: [
      { label: 'New', data: nvr.map((d) => d.new), backgroundColor: '#3b82d4' },
      { label: 'Returning', data: nvr.map((d) => d.returning), backgroundColor: '#7c5cd8' },
    ],
  }

  return (
    <div>
      <h2 style={styles.heading}>📈 User Engagement</h2>
      <div style={styles.kpiRow}>
        <KpiCard label="DAU" value={eng.dau} sub="Today" color="#3b82d4" />
        <KpiCard label="WAU" value={eng.wau} sub="Last 7 days" color="#7c5cd8" />
        <KpiCard label="MAU" value={eng.mau} sub="Last 30 days" color="#10b981" />
        <KpiCard label="Avg Session" value={`${Math.round(eng.avg_session_duration)}s`} sub="Duration" color="#f59e0b" />
        <KpiCard label="Total Sessions" value={eng.total_sessions} color="#ef4444" />
      </div>

      <div style={styles.chartRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>DAU Trend</h3>
          <div style={{ height: 220 }}><Line data={dauData} options={chartOpts} /></div>
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>New vs Returning Users</h3>
          <div style={{ height: 220 }}><Bar data={nvrData} options={{ ...chartOpts, scales: { x: { stacked: true }, y: { stacked: true } } }} /></div>
        </div>
      </div>

      {ret && (
        <div style={styles.tableBox}>
          <h3 style={styles.chartTitle}>User Retention</h3>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Cohort</th>
              <th style={styles.th}>Retention Rate</th>
            </tr></thead>
            <tbody>
              <tr><td style={styles.td}>Day 1</td><td style={styles.td}>{ret.day1}%</td></tr>
              <tr><td style={styles.td}>Day 7</td><td style={styles.td}>{ret.day7}%</td></tr>
              <tr><td style={styles.td}>Day 30</td><td style={styles.td}>{ret.day30}%</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2328' },
  kpiRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  chartBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 },
  chartTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1f2328' },
  tableBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', background: '#f7f8fa', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e5e7eb' },
  td: { padding: '8px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  loading: { color: '#57606a', padding: 24 },
  error: { color: '#c0392b', padding: 24 },
}
