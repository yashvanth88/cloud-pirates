#!/usr/bin/env node
require('dotenv').config()
const express = require('express')
const fetch = global.fetch || require('node-fetch')
const app = express()
app.use(express.json({ limit: '50mb' }))

// This proxy accepts { scan_url } and forwards the image bytes to an external
// inference endpoint (e.g., Gemini / PaLM / Vertex AI). It is intentionally
// generic: set GEMINI_ENDPOINT and GEMINI_API_KEY to point to your model API.

const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT || ''
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

app.post('/predict', async (req, res) => {
  const { scan_url } = req.body || {}
  if (!scan_url) return res.status(400).json({ error: 'scan_url required' })

  try {
    // fetch image bytes
    const r = await fetch(scan_url)
    if (!r.ok) return res.status(502).json({ error: 'failed_fetch_scan', status: r.status })
    const buf = await r.arrayBuffer()
    const body = Buffer.from(buf)

    if (!GEMINI_ENDPOINT) {
      // fallback mock inference
      const labels = ['possible pneumonia','no acute findings','possible fracture','artifact']
      const label = labels[Math.floor(Math.random()*labels.length)]
      const confidence = Math.round((0.6 + Math.random()*0.4) * 100)/100
      return res.json({ label, confidence, note: 'mock-inference (no GEMINI_ENDPOINT configured)' })
    }

    // Forward raw image bytes to GEMINI endpoint. Adjust according to the
    // external API requirements. Many APIs accept JSON with base64 image or
    // multipart/form-data — update as needed for the target service.
    const forwardRes = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': GEMINI_API_KEY ? `Bearer ${GEMINI_API_KEY}` : undefined,
        'Content-Type': 'application/octet-stream'
      },
      body
    })

    const text = await forwardRes.text()
    let parsed = null
    try { parsed = JSON.parse(text) } catch(e) { parsed = { raw: text } }
    if (!forwardRes.ok) return res.status(502).json({ error: 'inference_error', status: forwardRes.status, body: parsed })
    return res.json(parsed)
  } catch (e) {
    console.error('proxy error', e)
    return res.status(500).json({ error: 'proxy_error', message: String(e) })
  }
})

const PORT = process.env.INFERENCE_PROXY_PORT || 5000
app.listen(PORT, ()=>console.log(`Inference proxy listening on ${PORT}`))
