require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const AWS = require('aws-sdk');
const multer = require('multer');
const nodemailer = require('nodemailer');
const WorkflowExecutor = require('./workflows');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Setup email transporter (using Gmail or SMTP)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

// Pass emailTransporter to WorkflowExecutor
const workflowExecutor = new WorkflowExecutor(pool, process.env.GEMINI_API_KEY, emailTransporter);

// Configure S3 (Civo Object Storage compatible)
const spacesEndpoint = new AWS.Endpoint(`https://${process.env.SPACES_ENDPOINT || 'objectstore.mum1.civo.com'}`);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
  region: process.env.SPACES_REGION || 'mum1',
  s3ForcePathStyle: true,
  signatureVersion: 's3v4',
  sslEnabled: true,
  maxRetries: 3,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Create API router
const apiRouter = express.Router();

// POST /api/emr -> create EMR
apiRouter.post('/emr', async (req, res) => {
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

// GET /api/emrs -> list EMRs (admin)
apiRouter.get('/emrs', async (req, res) => {
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

// POST /api/upload/:emrId -> upload scan, save scan record, run mock inference, save inference
apiRouter.post('/upload/:emrId', upload.single('scan'), async (req, res) => {
  try {
    const { emrId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'file required under "scan" field' });

    // validate simple types
    const allowed = ['image/png', 'image/jpeg'];
    if (!allowed.includes(req.file.mimetype)) return res.status(400).json({ error: 'invalid_file_type' });

    const key = `scans/${Date.now()}-${req.file.originalname}`;
    
    // Mock upload if S3/Spaces is not configured
    let fileUrl;
    if (process.env.SPACES_BUCKET) {
      const params = {
        Bucket: process.env.SPACES_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ACL: 'public-read',
        ContentType: req.file.mimetype,
      };
      const uploadRes = await s3.upload(params).promise();
      fileUrl = uploadRes.Location;
    } else {
      // Convert to data URL for mock storage
      const base64 = req.file.buffer.toString('base64');
      fileUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

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
    console.error('Upload error:', err.code || err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'upload_error', details: err.code || err.message });
  }
});

// GET /api/emr/:id -> return EMR + scans + inferences
apiRouter.get('/emr/:id', async (req, res) => {
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
apiRouter.post('/mock-infer', async (req, res) => {
  const { scan_url } = req.body || {};
  const result = await mockInfer(scan_url);
  res.json(result);
});

// Workflow management endpoints
apiRouter.post('/workflow', async (req, res) => {
  try {
    const { name, payload } = req.body;
    if (!name || !payload) return res.status(400).json({ error: 'name and payload required' });

    const result = await pool.query(
      'INSERT INTO workflows (name, payload) VALUES ($1, $2) RETURNING id, created_at',
      [name, JSON.stringify(payload)]
    );
    res.json({ id: result.rows[0].id, created_at: result.rows[0].created_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'workflow_save_error' });
  }
});

apiRouter.get('/workflows', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, created_at FROM workflows ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'workflow_fetch_error' });
  }
});

apiRouter.get('/workflow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM workflows WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'workflow_not_found' });
    
    const workflow = result.rows[0];
    let payload = workflow.payload;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch(e) { /* ignore */ }
    }
    res.json({ ...workflow, payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'workflow_fetch_error' });
  }
});

apiRouter.delete('/workflow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM workflows WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'workflow_delete_error' });
  }
});

// Execute workflow
apiRouter.post('/workflow/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { emr_id } = req.body;
    
    if (!emr_id) return res.status(400).json({ error: 'emr_id required' });
    
    // Fetch workflow
    const wfRes = await pool.query('SELECT * FROM workflows WHERE id = $1', [id]);
    if (wfRes.rowCount === 0) return res.status(404).json({ error: 'workflow_not_found' });
    
    const workflow = wfRes.rows[0];
    let payload = workflow.payload;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch(e) { /* ignore */ }
    }
    
    // Create execution record
    const execRes = await pool.query(
      'INSERT INTO executions (workflow_id, emr_id, status, logs) VALUES ($1, $2, $3, $4) RETURNING id',
      [id, emr_id, 'running', JSON.stringify({ start: new Date().toISOString() })]
    );
    const executionId = execRes.rows[0].id;
    
    // Execute workflow with real block execution
    const executionResult = await workflowExecutor.executeWorkflow(id, emr_id, payload, executionId);
    
    // Get AI insights if Gemini is available
    const scansRes = await pool.query('SELECT * FROM scans WHERE emr_id = $1', [emr_id]);
    const aiInsights = await workflowExecutor.generateMedicalInsights(emr_id, scansRes.rows);
    
    const result = {
      status: executionResult.success ? 'completed' : 'failed',
      message: executionResult.success ? 'Workflow executed successfully' : executionResult.error,
      blocksExecuted: executionResult.executedBlocks || 0,
      blockResults: executionResult.results,
      logs: executionResult.logs,
      aiInsights: aiInsights.status !== 'skipped' ? aiInsights : null,
      timestamp: new Date().toISOString()
    };
    
    // Update execution with result
    await pool.query(
      'UPDATE executions SET status = $1, result = $2 WHERE id = $3',
      [result.status, JSON.stringify(result), executionId]
    );
    
    res.json({ execution_id: executionId, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'workflow_execution_error' });
  }
});

// Get execution status
apiRouter.get('/workflow/execution/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM executions WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'execution_not_found' });
    
    const execution = result.rows[0];
    let logs = execution.logs;
    let resultData = execution.result;
    if (typeof logs === 'string') {
      try { logs = JSON.parse(logs); } catch(e) { /* ignore */ }
    }
    if (typeof resultData === 'string') {
      try { resultData = JSON.parse(resultData); } catch(e) { /* ignore */ }
    }

    // Get email logs for this execution
    const emailLogsRes = await pool.query('SELECT * FROM email_logs WHERE execution_id = $1 ORDER BY created_at DESC', [id]);
    const emailLogs = emailLogsRes.rows;
    
    res.json({ ...execution, logs, result: resultData, emailLogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'execution_fetch_error' });
  }
});

// Email test endpoint
apiRouter.post('/test-email', async (req, res) => {
  try {
    const { recipient, subject = 'Test Email', message = 'This is a test email' } = req.body;
    
    if (!recipient) {
      return res.status(400).json({ error: 'recipient email required' });
    }

    console.log(`\n🧪 TEST EMAIL REQUEST:`);
    console.log(`   To: ${recipient}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message: ${message}\n`);

    // Try nodemailer first (Gmail SMTP with timeout)
    let smtpAttempted = false;
    let smtpError = null;
    
    if (emailTransporter) {
      smtpAttempted = true;
      try {
        // Set a 5-second timeout
        const sendPromise = emailTransporter.sendMail({
          from: process.env.EMAIL_USER || 'test@cloudpirates.local',
          to: recipient,
          subject: subject,
          html: `<h2>${subject}</h2><p>${message}</p><p><em>Sent at: ${new Date().toISOString()}</em></p>`
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SMTP timeout (5s)')), 5000)
        );

        await Promise.race([sendPromise, timeoutPromise]);
        
        return res.json({ 
          success: true, 
          method: 'Gmail SMTP',
          recipient: recipient,
          message: 'Email sent successfully via Gmail SMTP'
        });
      } catch (err) {
        smtpError = err.message;
        console.error(`❌ Gmail SMTP failed: ${err.message}`);
      }
    }

    // If SMTP failed or not configured, provide feedback
    res.json({
      success: false,
      method: 'Gmail SMTP',
      recipient: recipient,
      smtp_attempted: smtpAttempted,
      smtp_error: smtpError,
      message: `Email not sent. SMTP Error: ${smtpError || 'Not configured'}. Check backend logs for console output.`,
      note: 'Emails are logged to console. Configure Brevo API key (BREVO_API_KEY env var) for reliable email delivery.'
    });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ error: 'test_email_error', details: err.message });
  }
});

// Initialize database tables (idempotent)
apiRouter.post('/init-db', async (req, res) => {
  try {
    console.log('Initializing database tables...');
    
    // Create email_logs table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        execution_id INT REFERENCES executions(id) ON DELETE CASCADE,
        recipient TEXT NOT NULL,
        subject TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    
    console.log('✅ Database tables initialized');
    res.json({ success: true, message: 'Database tables initialized' });
  } catch (err) {
    console.error('Database initialization error:', err.message);
    res.status(500).json({ error: 'db_init_error', details: err.message });
  }
});

// Mount API router
app.use('/api', apiRouter);

// Health endpoint for readiness/liveness checks (not under /api)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
