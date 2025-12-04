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
      <h2>Upload Scan</h2>
      <form onSubmit={upload}>
        <input type="file" accept="image/png,image/jpeg" onChange={e=>{
          const f = e.target.files[0]
          setFile(f)
          if (f) setPreview(URL.createObjectURL(f))
          else setPreview(null)
        }} />
        <button type="submit">Upload</button>
      </form>
      {preview && (
        <div style={{marginTop:8}}>
          <div>Preview:</div>
          <img src={preview} alt="preview" style={{maxWidth:200,marginTop:6,border:'1px solid #ddd'}} />
        </div>
      )}
      <div style={{marginTop:8}}>{status}</div>
    </div>
  )
}
