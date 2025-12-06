-- Minimal schema for MVP
CREATE TABLE IF NOT EXISTS emr (
  id SERIAL PRIMARY KEY,
  patient_name TEXT NOT NULL,
  age INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  emr_id INT REFERENCES emr(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inferences (
  id SERIAL PRIMARY KEY,
  scan_id INT REFERENCES scans(id) ON DELETE CASCADE,
  label TEXT,
  confidence REAL,
  created_at TIMESTAMP DEFAULT now()
);

-- Workflows: store saved workflow graphs
CREATE TABLE IF NOT EXISTS workflows (
  id SERIAL PRIMARY KEY,
  name TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Executions: persisted workflow runs
CREATE TABLE IF NOT EXISTS executions (
  id SERIAL PRIMARY KEY,
  workflow_id INT REFERENCES workflows(id) ON DELETE CASCADE,
  emr_id INT,
  status TEXT DEFAULT 'queued',
  logs JSONB,
  result JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Email logs: track all notifications sent
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
