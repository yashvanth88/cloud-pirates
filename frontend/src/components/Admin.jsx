import React from 'react'

export default function Admin({ onSelect }){
  const [rows, setRows] = React.useState(null)

  React.useEffect(()=>{
    let mounted = true
    (async ()=>{
      try {
        const res = await fetch('/api/emrs')
        const text = await res.text()
        if (!mounted) return
        if (!res.ok) return setRows([])
        try { setRows(JSON.parse(text)) } catch (e) { console.error('Invalid JSON /emrs', e); setRows([]) }
      } catch (e) {
        console.error(e)
        if (mounted) setRows([])
      }
    })()
    return ()=> mounted = false
  }, [])

  if (!rows) return <div>Loading EMRs...</div>

  return (
    <div>
      <h2>Admin — EMR List</h2>
      {rows.length === 0 && <div>No EMRs</div>}
      <ul>
        {rows.map(r => (
          <li key={r.id} style={{marginBottom:8}}>
            <strong>{r.patient_name}</strong> — Age: {r.age} — {r.created_at}
            <button style={{marginLeft:8}} onClick={()=>onSelect(r.id)}>Open</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
