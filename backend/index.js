require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const AWS = require('aws-sdk');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Configure S3 (DigitalOcean Spaces compatible)
const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT || 'nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
  region: process.env.SPACES_REGION || 'us-east-1',
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /emr -> create EMR
app.post('/emr', async (req, res) => {
  try {
    const { patient_name, age, notes } = req.body;
    if (!patient_name) return res.status(400).json({ error: 'patient_name required' });

    const result = await pool.query(
      'INSERT INTO emr (patient_name, age, notes) VALUES ($1, $2, $3) RETURNING id, created_at',
      [patient_name, age || null, notes || null]
    );
    res.json({ id: result.rows[0].id, created_at: result.rows[0].created_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// GET /emrs -> list EMRs (admin)
app.get('/emrs', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, patient_name, age, created_at FROM emr ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Helper: mock inference (simulate async ML) with optional external inference service
async function mockInfer(scanUrl) {
  if (process.env.INFERENCE_URL) {
    try {
      const res = await fetch(process.env.INFERENCE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_url: scanUrl }),
      });
      if (res.ok) return await res.json();
      console.warn('External inference failed, falling back to local mock');
    } catch (e) {
      console.warn('Error calling external inference:', e);
    }
  }
  await new Promise((r) => setTimeout(r, 900));
  const labels = ['possible pneumonia', 'no acute findings', 'possible fracture', 'artifact'];
  const label = labels[Math.floor(Math.random() * labels.length)];
  const confidence = Math.round((0.6 + Math.random() * 0.4) * 100) / 100; // 0.6-1.0
  return { label, confidence };
}

// POST /upload/:emrId -> upload scan, save scan record, run mock inference, save inference
app.post('/upload/:emrId', upload.single('scan'), async (req, res) => {
  try {
    const { emrId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'file required under "scan" field' });

    // validate simple types
    const allowed = ['image/png', 'image/jpeg'];
    if (!allowed.includes(req.file.mimetype)) return res.status(400).json({ error: 'invalid_file_type' });

    const key = `scans/${Date.now()}-${req.file.originalname}`;
    const params = {
      Bucket: process.env.SPACES_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    };

    const uploadRes = await s3.upload(params).promise();
    const fileUrl = uploadRes.Location;

    // insert scan
    const scanInsert = await pool.query(
      'INSERT INTO scans (emr_id, file_url) VALUES ($1, $2) RETURNING id, uploaded_at',
      [emrId, fileUrl]
    );
    const scanId = scanInsert.rows[0].id;

    // run mock inference
    const inference = await mockInfer(fileUrl);

    // save inference
    await pool.query(
      'INSERT INTO inferences (scan_id, label, confidence) VALUES ($1, $2, $3)',
      [scanId, inference.label, inference.confidence]
    );

    res.json({ scan_id: scanId, file_url: fileUrl, inference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload_error' });
  }
});

// GET /emr/:id -> return EMR + scans + inferences
app.get('/emr/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const emrRes = await pool.query('SELECT * FROM emr WHERE id = $1', [id]);
    if (emrRes.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    const emr = emrRes.rows[0];

    const scansRes = await pool.query('SELECT * FROM scans WHERE emr_id = $1 ORDER BY uploaded_at DESC', [id]);
    const scans = await Promise.all(
      scansRes.rows.map(async (s) => {
        const infRes = await pool.query('SELECT * FROM inferences WHERE scan_id = $1 ORDER BY created_at DESC', [s.id]);
        return { ...s, inferences: infRes.rows };
      })
    );

    res.json({ emr, scans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Simple mock-infer route (useful for external calls)
app.post('/mock-infer', async (req, res) => {
  const { scan_url } = req.body || {};
  const result = await mockInfer(scan_url);
  res.json(result);
});

// Health endpoint for readiness/liveness checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
