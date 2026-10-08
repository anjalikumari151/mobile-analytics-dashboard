import { ReactNode } from 'react'
import TopBar from '../components/TopBar'

interface DashboardLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export default function DashboardLayout({ sidebar, children }: DashboardLayoutProps) {
  return (
    <div style={styles.root}>
      {sidebar}
      <div style={styles.main}>
        <TopBar />
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  content: { flex: 1, padding: '24px', overflowY: 'auto' },
}
