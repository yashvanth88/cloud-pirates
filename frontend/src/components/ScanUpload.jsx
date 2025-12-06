import React from 'react'

export default function ScanUpload({ emrId, onUploaded }){
  const [file, setFile] = React.useState(null)
  const [status, setStatus] = React.useState('')
  const [preview, setPreview] = React.useState(null)

  async function upload(e){
    e.preventDefault()
    if (!file) return setStatus('Select a file')
    setStatus('Uploading...')
    const fd = new FormData()
    fd.append('scan', file)
    try {
      const res = await fetch(`/api/upload/${emrId}`, { method: 'POST', body: fd })
      const text = await res.text()
      if (!res.ok) {
        setStatus('Upload failed: ' + (text || res.status))
        return
      }
      let j
      try { j = JSON.parse(text) } catch (e) { setStatus('Upload succeeded but server returned invalid JSON'); return }
      setStatus(`Inference: ${j.inference.label} (${j.inference.confidence})`)
      // show stored image url as preview
      setPreview(j.file_url)
      if (typeof onUploaded === 'function') onUploaded(j)
    } catch (err) {
      setStatus('Network error: ' + (err.message || err))
    }
  }

  return (
    <div>
      <h2 style={{color:'#e2e8f0'}}>Upload Scan</h2>
      <form onSubmit={upload} style={{backgroundColor:'#1e293b',padding:'20px',borderRadius:'12px',border:'1px solid #334155'}}>
        <input type="file" accept="image/png,image/jpeg" onChange={e=>{
          const f = e.target.files[0]
          setFile(f)
          if (f) setPreview(URL.createObjectURL(f))
          else setPreview(null)
        }} style={{padding:'8px',color:'#e2e8f0',backgroundColor:'#0f172a',border:'1px solid #334155',borderRadius:'6px',marginBottom:'12px'}} />
        <button type="submit" style={{padding:'10px 20px',backgroundColor:'#0ea5e9',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'600'}}>Upload</button>
      </form>
      {preview && (
        <div style={{marginTop:8}}>
          <div style={{color:'#e2e8f0'}}>Preview:</div>
          <img src={preview} alt="preview" style={{maxWidth:200,marginTop:6,border:'1px solid #334155',borderRadius:'8px'}} />
        </div>
      )}
      <div style={{marginTop:8,color:'#94a3b8'}}>{status}</div>
    </div>
  )
}
