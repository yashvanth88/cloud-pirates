require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(DB_FILE);

// ensure uploads dir
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// initialize schema from schema.sql
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
db.exec(schema, (err) => {
  if (err) {
    console.warn('Postgres-style schema failed on SQLite, applying fallback SQLite schema. Error:', err.message);
    const fallback = `
    CREATE TABLE IF NOT EXISTS emr (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT NOT NULL,
      age INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emr_id INTEGER,
      file_url TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (emr_id) REFERENCES emr(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER,
      label TEXT,
      confidence REAL,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      payload TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflow_id INTEGER,
      emr_id INTEGER,
      status TEXT DEFAULT 'queued',
      logs TEXT,
      result TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );
    `;
    db.exec(fallback, (err2) => {
      if (err2) console.error('Error creating fallback schema:', err2);
      else console.log('Fallback SQLite schema ensured');
    });
  } else {
    console.log('SQLite schema ensured');
  }
});

const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/emr', (req, res) => {
  const { patient_name, age, notes } = req.body;
  if (!patient_name) return res.status(400).json({ error: 'patient_name required' });
  const stmt = db.prepare('INSERT INTO emr (patient_name, age, notes) VALUES (?, ?, ?)');
  stmt.run(patient_name, age || null, notes || null, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'internal' });
    }
    res.json({ id: this.lastID });
  });
});

async function mockInfer(scanUrl) {
  // If an external inference URL is provided, POST the scan_url and use the response
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

  return new Promise((resolve) => {
    setTimeout(() => {
      const labels = ['possible pneumonia', 'no acute findings', 'possible fracture', 'artifact'];
      const label = labels[Math.floor(Math.random() * labels.length)];
      const confidence = Math.round((0.6 + Math.random() * 0.4) * 100) / 100;
      resolve({ label, confidence });
    }, 800);
  });
}

app.post('/upload/:emrId', upload.single('scan'), async (req, res) => {
  try {
    const { emrId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'file required' });

    // only allow images
    const allowed = ['image/png', 'image/jpeg'];
    if (!allowed.includes(req.file.mimetype)) return res.status(400).json({ error: 'invalid_file_type' });

    // move file to uploads with original name preserved
    const ext = path.extname(req.file.originalname) || '';
    const name = `scan-${Date.now()}${ext}`;
    const dest = path.join(UPLOAD_DIR, name);
    fs.renameSync(req.file.path, dest);

    const fileUrl = `http://localhost:8080/uploads/${name}`;

    db.run('INSERT INTO scans (emr_id, file_url) VALUES (?, ?)', [emrId, fileUrl], function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'db_insert' });
      }
      const scanId = this.lastID;
      // run inference (external if available) and save
      mockInfer(fileUrl).then((inference) => {
        db.run('INSERT INTO inferences (scan_id, label, confidence) VALUES (?, ?, ?)', [scanId, inference.label, inference.confidence], (e) => {
          if (e) console.error('save inference error', e);
          res.json({ scan_id: scanId, file_url: fileUrl, inference });
        });
      }).catch((e) => {
        console.error('inference error', e);
        res.status(500).json({ error: 'inference_error' });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload_error' });
  }
});

app.get('/emr/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM emr WHERE id = ?', [id], (err, emr) => {
    if (err) return res.status(500).json({ error: 'internal' });
    if (!emr) return res.status(404).json({ error: 'not_found' });
    db.all('SELECT * FROM scans WHERE emr_id = ? ORDER BY uploaded_at DESC', [id], (err2, scans) => {
      if (err2) return res.status(500).json({ error: 'internal' });
      const promises = scans.map((s) => new Promise((resolve) => {
        db.all('SELECT * FROM inferences WHERE scan_id = ? ORDER BY created_at DESC', [s.id], (err3, inferences) => {
          resolve({ ...s, inferences: inferences || [] });
        });
      }));
      Promise.all(promises).then((scansWithInf) => res.json({ emr, scans: scansWithInf }));
    });
  });
});

// Admin: list EMRs
app.get('/emrs', (req, res) => {
  db.all('SELECT * FROM emr ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'internal' });
    res.json(rows);
  });
});

// Workflows: save and retrieve simple workflow graphs
app.post('/workflow', (req, res) => {
  const { name, payload } = req.body || {};
  if (!payload) return res.status(400).json({ error: 'payload required' });
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  db.run('INSERT INTO workflows (name, payload) VALUES (?, ?)', [name || null, payloadStr], function (err) {
    if (err) {
      console.error('save workflow error', err);
      return res.status(500).json({ error: 'db_insert' });
    }
    res.json({ id: this.lastID });
  });
});

app.get('/workflows', (req, res) => {
  db.all('SELECT id, name, created_at FROM workflows ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'internal' });
    res.json(rows);
  });
});

app.get('/workflow/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM workflows WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'internal' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    try {
      row.payload = JSON.parse(row.payload);
    } catch (e) {
      // keep as string if parse fails
    }
    res.json(row);
  });
});

// Simple in-process job queue for executing workflows (dev only)
const jobQueue = [];
let processing = false;

function processQueue() {
  if (processing) return;
  processing = true;
  (async function run() {
    while (jobQueue.length > 0) {
      const execId = jobQueue.shift();
      try {
        await executeJob(execId);
      } catch (e) {
        console.error('executeJob error', e);
      }
    }
    processing = false;
  })();
}

function updateExecution(execId, fields, cb) {
  const sets = [];
  const vals = [];
  Object.keys(fields).forEach(k => { sets.push(`${k} = ?`); vals.push(fields[k]); });
  vals.push(execId);
  db.run(`UPDATE executions SET ${sets.join(', ')} WHERE id = ?`, vals, cb);
}

async function executeJob(execId) {
  return new Promise((resolve) => {
    db.get('SELECT * FROM executions WHERE id = ?', [execId], async (err, execRow) => {
      if (err || !execRow) return resolve();
      updateExecution(execId, { status: 'running' }, () => {});
      const logs = [];
      try {
        const wfId = execRow.workflow_id;
        const emrId = execRow.emr_id;
        db.get('SELECT * FROM workflows WHERE id = ?', [wfId], async (e, wfRow) => {
          if (e || !wfRow) {
            logs.push({ level: 'error', msg: 'workflow not found' });
            updateExecution(execId, { status: 'failed', logs: JSON.stringify(logs) }, () => resolve());
            return;
          }
          let payload;
          try { payload = JSON.parse(wfRow.payload); } catch (pe) { payload = wfRow.payload }
          const nodes = (payload && payload.nodes) || [];
          for (const node of nodes) {
            const label = (node.data && node.data.label) || node.type || node.id;
            logs.push({ level: 'info', msg: `running node ${node.id} (${label})` });
            // simple heuristics for node type
            const nid = node.id || '';
            if (nid.startsWith('ai') || label.toLowerCase().includes('ai') ) {
              // find latest scan for emr
              db.get('SELECT * FROM scans WHERE emr_id = ? ORDER BY uploaded_at DESC LIMIT 1', [emrId], async (se, scanRow) => {
                const scanUrl = (scanRow && scanRow.file_url) || 'http://example.com/placeholder.png';
                logs.push({ level: 'info', msg: `calling inference for ${scanUrl}` });
                try {
                  const inf = await mockInfer(scanUrl);
                  // save inference (scan_id may be null)
                  const scanId = scanRow ? scanRow.id : null;
                  db.run('INSERT INTO inferences (scan_id, label, confidence) VALUES (?, ?, ?)', [scanId, inf.label, inf.confidence], (ie) => {
                    if (ie) console.error('save inference error', ie);
                    logs.push({ level: 'info', msg: `inference result: ${JSON.stringify(inf)}` });
                    // continue loop - but since db.get is async we just continue after callback
                  });
                } catch (ie) {
                  logs.push({ level: 'error', msg: 'inference failed' });
                }
              });
            } else if (nid.startsWith('notify') || label.toLowerCase().includes('notify')) {
              logs.push({ level: 'info', msg: `notify: ${JSON.stringify(node.data && node.data.config)}` });
            } else if (nid.startsWith('upload') || label.toLowerCase().includes('upload')) {
              logs.push({ level: 'info', msg: 'upload node (no-op in dev)' });
            } else {
              logs.push({ level: 'info', msg: `unknown node type ${node.id}` });
            }
          }

          // finalize
          setTimeout(() => {
            updateExecution(execId, { status: 'completed', logs: JSON.stringify(logs), result: JSON.stringify({ status: 'ok' }) }, () => resolve());
          }, 800);
        });
      } catch (ex) {
        logs.push({ level: 'error', msg: String(ex) });
        updateExecution(execId, { status: 'failed', logs: JSON.stringify(logs) }, () => resolve());
      }
    });
  });
}

// enqueue endpoint: run workflow against an EMR (dev)
app.post('/workflow/:id/execute', (req, res) => {
  const wfId = req.params.id;
  const { emrId } = req.body || {};
  db.run('INSERT INTO executions (workflow_id, emr_id, status) VALUES (?, ?, ?)', [wfId, emrId || null, 'queued'], function (err) {
    if (err) return res.status(500).json({ error: 'db_insert' });
    const execId = this.lastID;
    // If REDIS_URL is configured, enqueue to BullMQ; otherwise use in-process queue
    if (process.env.REDIS_URL || process.env.REDIS) {
      try {
        const { Queue } = require('bullmq');
        const IORedis = require('ioredis');
        const conn = new IORedis(process.env.REDIS_URL || process.env.REDIS);
        const q = new Queue(process.env.WORKER_QUEUE || 'workflow-execute', { connection: conn });
        q.add('run', { execId }).then(()=>{
          res.json({ executionId: execId, queued: true });
        }).catch((qe)=>{
          console.error('queue add error', qe);
          // fallback to in-process
          jobQueue.push(execId);
          processQueue();
          res.json({ executionId: execId, queued: false, error: 'redis_enqueue_failed' });
        });
      } catch (e) {
        console.warn('Redis enqueue failed, falling back to in-process', e.message);
        jobQueue.push(execId);
        processQueue();
        res.json({ executionId: execId });
      }
    } else {
      jobQueue.push(execId);
      processQueue();
      res.json({ executionId: execId });
    }
  });
});

app.get('/workflow/execution/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM executions WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'internal' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    try { row.logs = JSON.parse(row.logs || '[]') } catch(e) {}
    try { row.result = JSON.parse(row.result || '{}') } catch(e) {}
    res.json(row);
  });
});

// static serve uploads
app.use('/uploads', express.static(UPLOAD_DIR));

app.post('/mock-infer', async (req, res) => {
  const { scan_url } = req.body || {};
  const result = await mockInfer(scan_url);
  res.json(result);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Local dev backend (SQLite) running on ${PORT}`));
