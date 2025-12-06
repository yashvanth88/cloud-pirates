import React from 'react'

export default function Dashboard({ emrId, refreshKey = 0, onRefresh }){
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
      const res = await fetch(`/api/workflow/${id}/execute`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ emr_id: emrId }) })
      const json = await res.json()
      setLastExecution(json.execution_id || json.executionId)
      // poll status
      const execId = json.execution_id
      const poll = setInterval(async ()=>{
        const r2 = await fetch(`/api/workflow/execution/${execId}`)
        const j2 = await r2.json()
        if (j2.status && j2.status !== 'running' && j2.status !== 'queued'){
          clearInterval(poll)
          setRunning(false)
          if (onRefresh) onRefresh()
          alert('Workflow completed: ' + (j2.result?.status || 'success'))
        }
      }, 700)
    }catch(e){
      setRunning(false)
      alert('Run failed: '+ (e.message||e))
    }
  }

  if (!data) return <div style={{color:'#e2e8f0'}}>Loading dashboard...</div>
  if (data && data.error) return <div style={{color:'#ef4444'}}>Error loading EMR: {data.error}</div>

  return (
    <div>
      <h2 style={{color:'#e2e8f0'}}>Dashboard — EMR #{emrId}</h2>
      <div style={{padding:10,border:'1px solid #334155',borderRadius:6,backgroundColor:'#1e293b',color:'#e2e8f0'}}>
        <strong>{data.emr.patient_name}</strong> — Age: {data.emr.age}
        <div style={{marginTop:8,color:'#94a3b8'}}>{data.emr.notes}</div>
        <div style={{marginTop:12}}>
          <div style={{marginBottom:10}}>
            <label style={{marginRight:8,color:'#e2e8f0'}}>Run saved workflow:</label>
            <select onChange={(e)=>{ if (e.target.value) runWorkflow(e.target.value) }} defaultValue="" style={{padding:'8px 12px',borderRadius:'6px',border:'1px solid #334155',backgroundColor:'#0f172a',color:'#e2e8f0'}}>
              <option value="">-- choose workflow --</option>
              {workflows.map(w => <option key={w.id} value={w.id}>{w.name || `Workflow ${w.id}`}</option>)}
            </select>
            {running && <span style={{marginLeft:8,color:'#0ea5e9'}}>Running...</span>}
          </div>
          <h3 style={{color:'#e2e8f0'}}>Scans</h3>
          {data.scans.length === 0 && <div style={{color:'#94a3b8'}}>No scans</div>}
          {data.scans.map(s => (
            <div key={s.id} style={{marginBottom:10}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <a href={s.file_url} target="_blank" rel="noreferrer" style={{color:'#0ea5e9'}}>View scan</a>
                <img src={s.file_url} alt="scan" style={{maxWidth:120,maxHeight:120,border:'1px solid #334155'}} />
              </div>
              <div style={{color:'#94a3b8'}}>
                {s.inferences.map(i=> (
                  <div key={i.id} style={{padding:'8px',backgroundColor:'#0f172a',borderRadius:'4px',marginBottom:'4px'}}>{i.label} — {i.confidence}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
