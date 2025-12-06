import React from 'react'
import EMRForm from './components/EMRForm'
import ScanUpload from './components/ScanUpload'
import Dashboard from './components/Dashboard'
import Admin from './components/Admin'
import WorkflowBuilder from './components/WorkflowBuilder'
import WorkflowResults from './components/WorkflowResults'
import './styles.css'

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    borderBottom: '2px solid #0ea5e9',
    padding: '24px 32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerTitle: {
    margin: '0 0 4px 0',
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  headerSubtitle: {
    margin: '0',
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  nav: {
    display: 'flex',
    gap: '4px',
    padding: '12px 32px',
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
    flexWrap: 'wrap',
    alignItems: 'center',
    backdropFilter: 'blur(10px)'
  },
  navBtn: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden'
  },
  navBtnActive: {
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    boxShadow: '0 8px 16px rgba(14, 165, 233, 0.3)'
  },
  content: {
    flex: 1,
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  backBtn: {
    padding: '10px 16px',
    backgroundColor: '#334155',
    color: '#e2e8f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #334155',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  }
}

export default function App(){
  const [emrId, setEmrId] = React.useState(null)
  const [view, setView] = React.useState('dashboard')
  const [refreshKey, setRefreshKey] = React.useState(0)

  const handleNavClick = (newView) => {
    setView(newView)
    setEmrId(null)
  }

  const getNavBtnStyle = (btnView) => ({
    ...styles.navBtn,
    ...(view === btnView ? styles.navBtnActive : {})
  })

  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'patients', label: '👥 Patients', icon: '👥' },
    { id: 'records', label: '📋 Records', icon: '📋' },
    { id: 'workflows', label: '⚙️ Workflows', icon: '⚙️' },
    { id: 'results', label: '🎯 Results', icon: '🎯' }
  ]

  return (
    <div style={styles.container}>
      {/* Premium Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🏥 Cloud Pirates</h1>
        <p style={styles.headerSubtitle}>Hospital Workflow Management System • Production Ready</p>
      </div>

      {/* Modern Navigation */}
      <div style={styles.nav}>
        {navItems.map(item => (
          <button
            key={item.id}
            style={getNavBtnStyle(item.id)}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        {/* Dashboard - Home Screen */}
        {view === 'dashboard' && (
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', marginBottom: '24px', fontWeight: '700' }}>
              Welcome to Cloud Pirates
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '24px'
            }}>
              {/* Quick Action Cards */}
              <div
                style={{...styles.card, cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s ease'}}
                onClick={() => handleNavClick('patients')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(14, 165, 233, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>➕</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '18px', fontWeight: '700' }}>Create Patient</h3>
                <p style={{ margin: '0', color: '#94a3b8', fontSize: '14px' }}>Start a new patient EMR record</p>
              </div>

              <div
                style={{...styles.card, cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s ease'}}
                onClick={() => handleNavClick('records')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(14, 165, 233, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📁</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '18px', fontWeight: '700' }}>View Records</h3>
                <p style={{ margin: '0', color: '#94a3b8', fontSize: '14px' }}>Access all patient records</p>
              </div>

              <div
                style={{...styles.card, cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s ease'}}
                onClick={() => handleNavClick('workflows')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(14, 165, 233, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚙️</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '18px', fontWeight: '700' }}>Workflows</h3>
                <p style={{ margin: '0', color: '#94a3b8', fontSize: '14px' }}>Build hospital automation</p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div style={{ marginTop: '48px', padding: '24px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ color: '#0ea5e9', marginTop: 0 }}>✨ Key Features</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0 0 4px 0' }}>👨‍⚕️ Patient Management</p>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>Create and manage patient EMR records</p>
                </div>
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0 0 4px 0' }}>📸 Scan Management</p>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>Upload medical imaging files</p>
                </div>
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0 0 4px 0' }}>🤖 AI Analysis</p>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>Automatic scan analysis</p>
                </div>
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0 0 4px 0' }}>🔄 Workflows</p>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>No-code automation builder</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Patient */}
        {view === 'patients' && (
          <>
            {!emrId ? (
              <EMRForm onCreated={(id) => { setEmrId(id) }} />
            ) : (
              <>
                <button style={styles.backBtn} onClick={() => { setEmrId(null); setView('patients') }}>
                  ← Back to Create
                </button>
                <ScanUpload emrId={emrId} onUploaded={() => setRefreshKey(k => k + 1)} />
                <hr style={{ margin: '24px 0', borderColor: '#334155' }} />
                <Dashboard emrId={emrId} refreshKey={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />
              </>
            )}
          </>
        )}

        {/* View Records */}
        {view === 'records' && (
          <Admin onSelect={(id)=>{ setEmrId(id); setView('view') }} />
        )}

        {/* Single Patient View */}
        {view === 'view' && emrId && (
          <>
            <button style={styles.backBtn} onClick={() => { setEmrId(null); setView('records') }}>
              ← Back to Records
            </button>
            <ScanUpload emrId={emrId} onUploaded={() => setRefreshKey(k => k + 1)} />
            <hr style={{ margin: '24px 0', borderColor: '#334155' }} />
            <Dashboard emrId={emrId} refreshKey={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />
          </>
        )}

        {/* Workflows */}
        {view === 'workflows' && (
          <div>
            <button style={styles.backBtn} onClick={() => handleNavClick('dashboard')}>
              ← Back to Dashboard
            </button>
            <WorkflowBuilder />
          </div>
        )}

        {/* Workflow Results */}
        {view === 'results' && (
          <WorkflowResults />
        )}
      </div>
    </div>
  )
}
