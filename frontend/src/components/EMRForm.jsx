import React from 'react'

const styles = {
  form: {
    backgroundColor: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    marginBottom: '20px',
    border: '1px solid #334155'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#e2e8f0',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #334155',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    backgroundColor: '#0f172a',
    color: '#e2e8f0'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #334155',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    minHeight: '100px',
    resize: 'vertical',
    transition: 'all 0.2s ease',
    backgroundColor: '#0f172a',
    color: '#e2e8f0'
  },
  button: {
    backgroundColor: '#0ea5e9',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    cursor: 'not-allowed'
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    color: '#2c3e50'
  }
}

export default function EMRForm({ onCreated }){
  const [patientName, setPatientName] = React.useState('')
  const [age, setAge] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function submit(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/emr', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ patient_name: patientName, age: Number(age), notes })
      })
      const text = await res.text()
      
      if (!res.ok) {
        const msg = text || `Server responded ${res.status}`
        setError('Error creating EMR: ' + msg)
        setLoading(false)
        return
      }
      
      let j
      try { j = JSON.parse(text) } catch (e) { 
        setError('Invalid response from server')
        setLoading(false)
        return
      }
      
      if (j.id) {
        onCreated(j.id)
      } else {
        setError('No patient ID returned')
        setLoading(false)
      }
    } catch (err) {
      setError('Network error: ' + (err.message || err))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={styles.form}>
      <h2 style={styles.title}>Create Patient Record</h2>
      
      {error && (
        <div style={{ backgroundColor: '#fee', padding: '12px', borderRadius: '4px', color: '#c33', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Patient Name *</label>
        <input
          style={styles.input}
          value={patientName}
          onChange={e => setPatientName(e.target.value)}
          placeholder="e.g., John Doe"
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Age</label>
        <input
          style={styles.input}
          value={age}
          onChange={e => setAge(e.target.value)}
          type="number"
          placeholder="e.g., 35"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Medical Notes</label>
        <textarea
          style={styles.textarea}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Enter patient history, symptoms, or other relevant information..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
      >
        {loading ? 'Creating Patient...' : 'Create Patient Record'}
      </button>
    </form>
  )
}
