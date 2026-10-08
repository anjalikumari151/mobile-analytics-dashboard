const sections = [
  { id: 'engagement', label: '📈 Engagement' },
  { id: 'devices', label: '📱 Devices' },
  { id: 'geo', label: '🌍 Geography' },
  { id: 'performance', label: '⚡ Performance' },
  { id: 'events', label: '🎯 Events & Funnel' },
  { id: 'notifications', label: '🔔 Notifications' },
  { id: 'alerts', label: '🚨 Alerts' },
]

interface SidebarProps {
  activeSection: string
  onSelect: (id: string) => void
}

export default function Sidebar({ activeSection, onSelect }: SidebarProps) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>📱 MobileAnalytics</div>
      <nav style={styles.nav}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              ...styles.navItem,
              ...(activeSection === s.id ? styles.navItemActive : {}),
            }}
          >
            {s.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    minHeight: '100vh',
    background: '#1f2328',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  logo: {
    padding: '20px 16px',
    fontSize: 15,
    fontWeight: 700,
    borderBottom: '1px solid #30363d',
    color: '#fff',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 0',
  },
  navItem: {
    background: 'none',
    border: 'none',
    color: '#8b949e',
    textAlign: 'left',
    padding: '10px 16px',
    fontSize: 13,
    cursor: 'pointer',
    borderRadius: 0,
  },
  navItemActive: {
    color: '#fff',
    background: '#30363d',
    fontWeight: 600,
  },
}
