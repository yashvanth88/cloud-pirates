import React from 'react'

const styles = {
  container: {
    backgroundColor: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '1px solid #334155'
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '24px',
    color: '#e2e8f0',
    fontWeight: '700'
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '40px 20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px'
  },
  th: {
    backgroundColor: '#0f172a',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#0ea5e9',
    borderBottom: '2px solid #0ea5e9',
    fontSize: '13px'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #334155',
    color: '#e2e8f0',
    fontSize: '13px'
  },
  tr: {
    transition: 'background-color 0.2s ease'
  },
  trHover: {
    backgroundColor: '#334155'
  },
  button: {
    padding: '6px 12px',
    backgroundColor: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  loading: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8'
  }
}

export default function Admin({ onSelect }){
  const [rows, setRows] = React.useState([])
  const [hoverIndex, setHoverIndex] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(()=>{
    (async ()=>{
      try {
        console.log('Fetching /api/emrs...')
        const res = await fetch('/api/emrs')
        console.log('Response status:', res.status)
        
        if (!res.ok) {
          setError(`API returned ${res.status}`)
          setLoading(false)
          return
        }
        
        const data = await res.json()
        console.log('Fetched data:', data)
        setRows(Array.isArray(data) ? data : [])
        setError(null)
      } catch (e) {
        console.error('Fetch error:', e)
        setError(e.message)
        setRows([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div style={{...styles.loading, padding: '40px', backgroundColor: '#1e293b', minHeight: '200px'}}>⏳ Loading patient records...</div>
  if (error) return <div style={{...styles.loading, color: '#ef4444', padding: '40px', backgroundColor: '#1e293b', minHeight: '200px'}}>❌ Error: {error}</div>

  return (
    <div style={{...styles.container, minHeight: 'auto'}}>
      <h2 style={styles.title}>📋 Patient Records ({rows.length})</h2>
      
      {rows.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <p>No patient records yet</p>
          <p style={{ fontSize: '12px' }}>Create a new patient record to get started</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Patient Name</th>
              <th style={styles.th}>Age</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={r.id}
                style={{
                  ...styles.tr,
                  ...(hoverIndex === idx ? styles.trHover : {})
                }}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <td style={styles.td}><strong>{r.patient_name}</strong></td>
                <td style={styles.td}>{r.age || '—'}</td>
                <td style={styles.td}>{new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={styles.td}>
                  <button
                    style={styles.button}
                    onClick={() => {
                      if (typeof onSelect === 'function') onSelect(r.id)
                      else console.error('onSelect is not a function:', onSelect)
                    }}
                  >
                    View Record
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
