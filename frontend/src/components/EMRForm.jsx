import React from 'react'

export default function EMRForm({ onCreated }){
  const [patientName, setPatientName] = React.useState('')
  const [age, setAge] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/emr', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ patient_name: patientName, age: Number(age), notes })
      })
      const text = await res.text()
      setLoading(false)
      if (!res.ok) {
        const msg = text || `Server responded ${res.status}`
        return setLoading(false) || alert('Error creating EMR: ' + msg)
      }
      // try parse JSON
      let j
      try { j = JSON.parse(text) } catch (e) { return alert('Invalid JSON response from server') }
      if (j.id) onCreated(j.id)
    } catch (err) {
      setLoading(false)
      alert('Network error: ' + (err.message || err))
    }
  }

  return (
    <form onSubmit={submit} style={{marginBottom:20}}>
      <h2>Create EMR</h2>
      <div><label>Patient name<br/><input value={patientName} onChange={e=>setPatientName(e.target.value)} required /></label></div>
      <div><label>Age<br/><input value={age} onChange={e=>setAge(e.target.value)} type="number" /></label></div>
      <div><label>Notes<br/><textarea value={notes} onChange={e=>setNotes(e.target.value)} /></label></div>
      <div style={{marginTop:8}}><button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create EMR'}</button></div>
    </form>
  )
}
