import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import api from '../../utils/api'
import { useFilter } from '../../context/FilterContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend)

interface OsRow { os: string; count: number }
interface DeviceRow { device: string; count: number }
interface VersionRow { date: string; version: string; count: number }
interface NetRow { type: string; count: number }
interface DeviceData {
  os_distribution: OsRow[]
  top_devices: DeviceRow[]
  app_versions: VersionRow[]
  network_types: NetRow[]
}

const COLORS = ['#3b82d4', '#7c5cd8', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1']
const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }

export default function DeviceSection() {
  const { days } = useFilter()
  const [data, setData] = useState<DeviceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/metrics/devices?days=${days}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <p style={styles.loading}>Loading device data…</p>
  if (!data) return <p style={styles.error}>Failed to load data.</p>

  const osData = {
    labels: data.os_distribution.map((r) => r.os),
    datasets: [{ data: data.os_distribution.map((r) => r.count), backgroundColor: COLORS }],
  }

  const deviceData = {
    labels: data.top_devices.map((r) => r.device),
    datasets: [{ label: 'Users', data: data.top_devices.map((r) => r.count), backgroundColor: '#3b82d4' }],
  }

  // Unique versions for line chart
  const allVersions = [...new Set(data.app_versions.map((r) => r.version))]
  const allDates = [...new Set(data.app_versions.map((r) => r.date))].sort()
  const versionDatasets = allVersions.map((v, i) => ({
    label: v,
    data: allDates.map((d) => {
      const found = data.app_versions.find((r) => r.date === d && r.version === v)
      return found ? found.count : 0
    }),
    borderColor: COLORS[i % COLORS.length],
    backgroundColor: 'transparent',
    tension: 0.3,
  }))

  const netData = {
    labels: data.network_types.map((r) => r.type),
    datasets: [{ data: data.network_types.map((r) => r.count), backgroundColor: COLORS }],
  }

  return (
    <div>
      <h2 style={styles.heading}>📱 Device & Platform Analytics</h2>
      <div style={styles.chartGrid}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>OS Distribution</h3>
          <div style={{ height: 220 }}><Doughnut data={osData} options={chartOpts} /></div>
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Network Type</h3>
          <div style={{ height: 220 }}><Doughnut data={netData} options={chartOpts} /></div>
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Top 10 Devices</h3>
          <div style={{ height: 220 }}>
            <Bar data={deviceData} options={{ ...chartOpts, indexAxis: 'y' as const }} />
          </div>
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>App Version Adoption</h3>
          <div style={{ height: 220 }}>
            <Line data={{ labels: allDates, datasets: versionDatasets }} options={chartOpts} />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2328' },
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  chartBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 },
  chartTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1f2328' },
  loading: { color: '#57606a', padding: 24 },
  error: { color: '#c0392b', padding: 24 },
}
