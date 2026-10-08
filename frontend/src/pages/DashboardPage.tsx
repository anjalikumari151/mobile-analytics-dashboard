import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Sidebar from '../components/Sidebar'
import KpiCard from '../components/KpiCard'
import EngagementSection from './sections/EngagementSection'
import DeviceSection from './sections/DeviceSection'
import GeoSection from './sections/GeoSection'
import PerformanceSection from './sections/PerformanceSection'
import EventsSection from './sections/EventsSection'
import NotificationsSection from './sections/NotificationsSection'
import AlertsSection from './sections/AlertsSection'
import api from '../utils/api'
import { useFilter } from '../context/FilterContext'

interface KpiData {
  dau: number
  total_sessions: number
  avg_crash_rate: number
  overall_open_rate: number
}

const SECTION_MAP: Record<string, JSX.Element> = {
  engagement: <EngagementSection />,
  devices: <DeviceSection />,
  geo: <GeoSection />,
  performance: <PerformanceSection />,
  events: <EventsSection />,
  notifications: <NotificationsSection />,
  alerts: <AlertsSection />,
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('engagement')
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const { days } = useFilter()

  useEffect(() => {
    Promise.all([
      api.get(`/metrics/engagement?days=${days}`),
      api.get(`/metrics/performance?days=${days}`),
      api.get(`/metrics/notifications?days=${days}`),
    ]).then(([eng, perf, notif]) => {
      setKpi({
        dau: eng.data.dau,
        total_sessions: eng.data.total_sessions,
        avg_crash_rate: perf.data.avg_crash_rate,
        overall_open_rate: notif.data.overall_open_rate,
      })
    }).catch(() => {})
  }, [days])

  return (
    <DashboardLayout sidebar={<Sidebar activeSection={activeSection} onSelect={setActiveSection} />}>
      {kpi && (
        <div style={styles.kpiRow}>
          <KpiCard label="DAU" value={kpi.dau} sub="Today" color="#3b82d4" />
          <KpiCard label="Sessions" value={kpi.total_sessions} sub={`Last ${days}d`} color="#7c5cd8" />
          <KpiCard label="Crash Rate" value={`${kpi.avg_crash_rate}%`} sub="Avg" color="#ef4444" />
          <KpiCard label="Notif Open Rate" value={`${kpi.overall_open_rate}%`} color="#10b981" />
        </div>
      )}
      <div style={styles.section}>
        {SECTION_MAP[activeSection]}
      </div>
    </DashboardLayout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  kpiRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 },
  section: {},
}
