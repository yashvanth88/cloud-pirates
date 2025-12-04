#!/usr/bin/env node
require('dotenv').config();
const { Worker, Queue } = require('bullmq');
const IORedis = require('ioredis');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL);

const queueName = process.env.WORKER_QUEUE || 'workflow-execute';

const DB_FILE = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(DB_FILE);

function mockInfer(scanUrl) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const labels = ['possible pneumonia', 'no acute findings', 'possible fracture', 'artifact'];
      const label = labels[Math.floor(Math.random() * labels.length)];
      const confidence = Math.round((0.6 + Math.random() * 0.4) * 100) / 100;
      resolve({ label, confidence });
    }, 800);
  });
}

async function executeJob(execId) {
  return new Promise((resolve) => {
    db.get('SELECT * FROM executions WHERE id = ?', [execId], async (err, execRow) => {
      if (err || !execRow) return resolve();
      db.run('UPDATE executions SET status = ? WHERE id = ?', ['running', execId]);
      const logs = [];
      try {
        const wfId = execRow.workflow_id;
        const emrId = execRow.emr_id;
        db.get('SELECT * FROM workflows WHERE id = ?', [wfId], async (e, wfRow) => {
          if (e || !wfRow) {
            logs.push({ level: 'error', msg: 'workflow not found' });
            db.run('UPDATE executions SET status = ?, logs = ? WHERE id = ?', ['failed', JSON.stringify(logs), execId]);
            return resolve();
          }
          let payload;
          try { payload = JSON.parse(wfRow.payload); } catch (pe) { payload = wfRow.payload }
          const nodes = (payload && payload.nodes) || [];
          for (const node of nodes) {
            const label = (node.data && node.data.label) || node.type || node.id;
            logs.push({ level: 'info', msg: `running node ${node.id} (${label})` });
            const nid = node.id || '';
            if (nid.startsWith('ai') || label.toLowerCase().includes('ai') ) {
              db.get('SELECT * FROM scans WHERE emr_id = ? ORDER BY uploaded_at DESC LIMIT 1', [emrId], async (se, scanRow) => {
                const scanUrl = (scanRow && scanRow.file_url) || 'http://example.com/placeholder.png';
                logs.push({ level: 'info', msg: `calling inference for ${scanUrl}` });
                try {
                  const inf = await mockInfer(scanUrl);
                  const scanId = scanRow ? scanRow.id : null;
                  db.run('INSERT INTO inferences (scan_id, label, confidence) VALUES (?, ?, ?)', [scanId, inf.label, inf.confidence], (ie) => {
                    if (ie) console.error('save inference error', ie);
                    logs.push({ level: 'info', msg: `inference result: ${JSON.stringify(inf)}` });
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

          setTimeout(() => {
            db.run('UPDATE executions SET status = ?, logs = ?, result = ? WHERE id = ?', ['completed', JSON.stringify(logs), JSON.stringify({ status: 'ok' }), execId]);
            resolve();
          }, 800);
        });
      } catch (ex) {
        logs.push({ level: 'error', msg: String(ex) });
        db.run('UPDATE executions SET status = ?, logs = ? WHERE id = ?', ['failed', JSON.stringify(logs), execId]);
        resolve();
      }
    });
  });
}

console.log('Worker connecting to Redis at', REDIS_URL, 'queue:', queueName);

const worker = new Worker(queueName, async job => {
  const { execId } = job.data || {};
  if (!execId) return;
  console.log('Worker processing execId', execId);
  await executeJob(execId);
}, { connection });

worker.on('completed', (job) => {
  console.log('Job completed', job.id);
});
worker.on('failed', (job, err) => {
  console.error('Job failed', job.id, err);
});

process.on('SIGINT', async () => { console.log('Shutting down worker'); await worker.close(); process.exit(0); });

