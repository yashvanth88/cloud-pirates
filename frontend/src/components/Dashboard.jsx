import React from 'react'

export default function Dashboard({ emrId, refreshKey = 0 }){
  const [data, setData] = React.useState(null)

  React.useEffect(()=>{
    let mounted = true
    async function fetchData(){
      try {
        const res = await fetch(`/api/emr/${emrId}`)
        if (!mounted) return
        const text = await res.text()
        if (!res.ok) return setData({ error: text || `status ${res.status}` })
        try { setData(JSON.parse(text)) } catch (e) { setData({ error: 'Invalid JSON from server' }) }
      } catch (err) {
        if (!mounted) return
        setData({ error: 'Network error: ' + (err.message || err) })
      }
    }
    fetchData()
    return ()=> mounted = false
  }, [emrId, refreshKey])

  const [workflows, setWorkflows] = React.useState([])
  const [running, setRunning] = React.useState(false)
  const [lastExecution, setLastExecution] = React.useState(null)

  React.useEffect(()=>{
    fetch('/api/workflows').then(r=>r.json()).then(setWorkflows).catch(()=>setWorkflows([]))
  }, [])

  async function runWorkflow(id){
    setRunning(true)
    try{
      const res = await fetch(`/api/workflow/${id}/execute`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ emrId }) })
      const json = await res.json()
      setLastExecution(json.executionId || json.executionId)
      // poll status
      const execId = json.executionId
      const poll = setInterval(async ()=>{
        const r2 = await fetch(`/api/workflow/execution/${execId}`)
        const j2 = await r2.json()
        if (j2.status && j2.status !== 'running' && j2.status !== 'queued'){
          clearInterval(poll)
          setRunning(false)
          setRefreshKey(k=>k+1)
          alert('Workflow completed: ' + (j2.result && j2.result.status))
        }
      }, 700)
    }catch(e){
      setRunning(false)
      alert('Run failed: '+ (e.message||e))
    }
  }

  if (!data) return <div>Loading dashboard...</div>
  if (data && data.error) return <div style={{color:'red'}}>Error loading EMR: {data.error}</div>

  return (
    <div>
      <h2>Dashboard — EMR #{emrId}</h2>
      <div style={{padding:10,border:'1px solid #ddd',borderRadius:6}}>
        <strong>{data.emr.patient_name}</strong> — Age: {data.emr.age}
        <div style={{marginTop:8}}>{data.emr.notes}</div>
        <div style={{marginTop:12}}>
          <div style={{marginBottom:10}}>
            <label style={{marginRight:8}}>Run saved workflow:</label>
            <select onChange={(e)=>{ if (e.target.value) runWorkflow(e.target.value) }} defaultValue="">
              <option value="">-- choose workflow --</option>
              {workflows.map(w => <option key={w.id} value={w.id}>{w.name || `Workflow ${w.id}`}</option>)}
            </select>
            {running && <span style={{marginLeft:8}}>Running...</span>}
          </div>
          <h3>Scans</h3>
          {data.scans.length === 0 && <div>No scans</div>}
          {data.scans.map(s => (
            <div key={s.id} style={{marginBottom:10}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <a href={s.file_url} target="_blank" rel="noreferrer">View scan</a>
                <img src={s.file_url} alt="scan" style={{maxWidth:120,maxHeight:120,border:'1px solid #eee'}} />
              </div>
              <div>
                {s.inferences.map(i=> (
                  <div key={i.id}>{i.label} — {i.confidence}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
