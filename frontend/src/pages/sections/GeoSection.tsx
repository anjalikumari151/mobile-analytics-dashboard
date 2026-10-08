import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { useFilter } from '../../context/FilterContext'

interface GeoRow { country: string; city: string; users: number; pct: number }
interface GeoData { rows: GeoRow[]; total_users: number }

export default function GeoSection() {
  const { days } = useFilter()
  const [data, setData] = useState<GeoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'users' | 'country' | 'city' | 'pct'>('users')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/metrics/geo?days=${days}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <p style={styles.loading}>Loading geographic data…</p>
  if (!data) return <p style={styles.error}>Failed to load data.</p>

  const filtered = data.rows
    .filter((r) =>
      r.country.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  function SortIcon({ k }: { k: typeof sortKey }) {
    if (sortKey !== k) return <span style={{ color: '#ccc' }}> ↕</span>
    return <span> {sortAsc ? '↑' : '↓'}</span>
  }

  return (
    <div>
      <h2 style={styles.heading}>🌍 Geographic Analytics</h2>
      <div style={styles.bar}>
        <span style={styles.total}>Total Users: <strong>{data.total_users}</strong></span>
        <input
          style={styles.search}
          placeholder="Filter by country or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={styles.tableBox}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th} onClick={() => toggleSort('country')}>Country<SortIcon k="country" /></th>
              <th style={styles.th} onClick={() => toggleSort('city')}>City<SortIcon k="city" /></th>
              <th style={styles.th} onClick={() => toggleSort('users')}>Users<SortIcon k="users" /></th>
              <th style={styles.th} onClick={() => toggleSort('pct')}>% of Total<SortIcon k="pct" /></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={i % 2 === 0 ? {} : { background: '#fafafa' }}>
                <td style={styles.td}>{r.country}</td>
                <td style={styles.td}>{r.city}</td>
                <td style={styles.td}>{r.users}</td>
                <td style={styles.td}>
                  <div style={styles.pctRow}>
                    <div style={{ ...styles.pctBar, width: `${Math.min(r.pct, 100)}%` }} />
                    <span style={styles.pctLabel}>{r.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={{ ...styles.td, textAlign: 'center', color: '#57606a' }}>No results</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2328' },
  bar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  total: { fontSize: 13, color: '#57606a' },
  search: { padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, width: 260 },
  tableBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', background: '#f7f8fa', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none' },
  td: { padding: '9px 14px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  pctRow: { display: 'flex', alignItems: 'center', gap: 8 },
  pctBar: { height: 8, background: '#3b82d4', borderRadius: 4, transition: 'width 0.3s' },
  pctLabel: { fontSize: 12, color: '#57606a', whiteSpace: 'nowrap' },
  loading: { color: '#57606a', padding: 24 },
  error: { color: '#c0392b', padding: 24 },
}
