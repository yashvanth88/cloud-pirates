import React from 'react'
import EMRForm from './components/EMRForm'
import ScanUpload from './components/ScanUpload'
import Dashboard from './components/Dashboard'
import Admin from './components/Admin'
import WorkflowBuilder from './components/WorkflowBuilder'

export default function App(){
  const [emrId, setEmrId] = React.useState(null)
  const [view, setView] = React.useState('create') // create | admin | emr | builder
  const [refreshKey, setRefreshKey] = React.useState(0)
  return (
    <div style={{padding:20,fontFamily:'Arial, sans-serif'}}>
      <h1>Cloud Pirates - Hospital No-Code (MVP)</h1>
      <div style={{marginBottom:12}}>
        <button onClick={()=>{ setView('create'); setEmrId(null)}}>Create EMR</button>
        <button style={{marginLeft:8}} onClick={()=>setView('admin')}>Admin</button>
        <button style={{marginLeft:8}} onClick={()=>setView('builder')}>Builder</button>
      </div>

      {view === 'create' && (
        <>
          {!emrId && <EMRForm onCreated={(id) => { setEmrId(id); setView('emr') }} />}
          {emrId && (
            <>
              <ScanUpload emrId={emrId} onUploaded={() => setRefreshKey(k => k + 1)} />
              <hr />
              <Dashboard emrId={emrId} refreshKey={refreshKey} />
            </>
          )}
        </>
      )}

      {view === 'admin' && (
        <Admin onSelect={(id)=>{ setEmrId(id); setView('emr') }} />
      )}

      {view === 'builder' && (
        <div>
          <div style={{marginBottom:8}}><button onClick={()=>setView('create')}>Back</button></div>
          <WorkflowBuilder />
        </div>
      )}

      {view === 'emr' && emrId && (
        <>
          <div style={{marginBottom:8}}><button onClick={()=>setView('create')}>Back</button></div>
          <ScanUpload emrId={emrId} onUploaded={() => setRefreshKey(k => k + 1)} />
          <hr />
          <Dashboard emrId={emrId} refreshKey={refreshKey} />
        </>
      )}
    </div>
  )
}
