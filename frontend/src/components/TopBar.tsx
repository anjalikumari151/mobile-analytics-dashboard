import { useNavigate } from 'react-router-dom'
import { useFilter } from '../context/FilterContext'

export default function TopBar() {
  const navigate = useNavigate()
  const { days, setDays } = useFilter()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <header style={styles.topbar}>
      <span style={styles.title}>Mobile Usage Analytics Dashboard</span>
      <div style={styles.right}>
        <label style={styles.rangeLabel}>Date Range:</label>
        <select
          style={styles.select}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    height: 56,
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
  },
  title: { fontWeight: 700, fontSize: 15, color: '#1f2328' },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  rangeLabel: { fontSize: 13, color: '#57606a' },
  select: {
    padding: '5px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
  },
  logoutBtn: {
    padding: '5px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    background: '#fff',
    fontSize: 13,
    cursor: 'pointer',
    color: '#57606a',
  },
}
