import React, { useState, useEffect } from 'react';
import './WorkflowResults.css';

export default function WorkflowResults() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emrId, setEmrId] = useState(9);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://212.2.246.88/api/workflows');
      const data = await response.json();
      setWorkflows(Array.isArray(data) ? data : data.workflows || []);
    } catch (err) {
      setError('Failed to fetch workflows: ' + err.message);
    }
  };

  const executeWorkflow = async () => {
    if (!selectedWorkflow) {
      setError('Please select a workflow');
      return;
    }

    setLoading(true);
    setError('');
    setExecutionResult(null);

    try {
      const response = await fetch(`http://212.2.246.88/api/workflow/${selectedWorkflow}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emr_id: parseInt(emrId) })
      });

      const result = await response.json();
      setExecutionResult(result);
    } catch (err) {
      setError('Failed to execute workflow: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBlockIcon = (blockType) => {
    const icons = {
      emr: '📋',
      inventory: '📦',
      storage: '☁️',
      upload: '📤',
      ai: '🤖',
      billing: '💰',
      notify: '📬',
      notification: '📬',
      graph: '📊',
      api: '🔗'
    };
    return icons[blockType] || '⚙️';
  };

  return (
    <div className="workflow-results-container">
      <div className="results-header">
        <h1>🎯 Workflow Execution Results</h1>
        <p>Execute and visualize workflow results in real-time</p>
      </div>

      <div className="execution-controls">
        <div className="control-group">
          <label>Select Workflow:</label>
          <select 
            value={selectedWorkflow || ''} 
            onChange={(e) => setSelectedWorkflow(parseInt(e.target.value))}
            className="workflow-select"
          >
            <option value="">-- Select a Workflow --</option>
            {workflows.map(wf => (
              <option key={wf.id} value={wf.id}>
                {wf.id}: {wf.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>EMR ID:</label>
          <input 
            type="number" 
            value={emrId} 
            onChange={(e) => setEmrId(e.target.value)}
            className="emr-input"
            placeholder="Enter EMR ID"
          />
        </div>

        <button 
          onClick={executeWorkflow}
          disabled={loading || !selectedWorkflow}
          className="execute-button"
        >
          {loading ? '⏳ Executing...' : '▶️ Execute Workflow'}
        </button>
      </div>

      {error && (
        <div className="error-box">
          ❌ {error}
        </div>
      )}

      {executionResult && (
        <div className="results-container">
          <div className="status-bar">
            <div className={`status-badge ${executionResult.status}`}>
              {executionResult.status === 'completed' ? '✅' : '⏳'} {executionResult.status.toUpperCase()}
            </div>
            <div className="blocks-count">
              🔗 {executionResult.blocksExecuted || 0} Blocks Executed
            </div>
          </div>

          <div className="blocks-grid">
            {executionResult.blockResults && Object.entries(executionResult.blockResults).map(([blockId, result]) => (
              <div key={blockId} className={`block-card ${result.status}`}>
                <div className="block-header">
                  <span className="block-icon">{getBlockIcon(result.type || blockId)}</span>
                  <span className="block-status">
                    {result.status === 'completed' ? '✅' : result.status === 'skipped' ? '⏭️' : '❌'}
                  </span>
                </div>
                <div className="block-content">
                  {result.status === 'completed' && (
                    <div className="block-results">
                      {result.patient_name && (
                        <div className="result-item">👤 <strong>{result.patient_name}</strong> (Age: {result.age})</div>
                      )}
                      {result.model_used && (
                        <div className="result-item">🤖 Model: <strong>{result.model_used}</strong></div>
                      )}
                      {result.scans_analyzed && (
                        <div className="result-item">📸 Scans: <strong>{result.scans_analyzed}</strong></div>
                      )}
                      {result.total_cost && (
                        <div className="result-item">💵 Cost: <strong>${result.total_cost.toFixed(2)}</strong></div>
                      )}
                      {result.chart_type && (
                        <div className="result-item">📈 Chart: <strong>{result.chart_type}</strong></div>
                      )}
                      {result.channels_notified && (
                        <div className="result-item">📢 Channels: <strong>{result.channels_notified.join(', ')}</strong></div>
                      )}
                      {result.items_tracked && (
                        <div className="result-item">📦 Inventory: <strong>{result.items_tracked.join(', ')}</strong></div>
                      )}
                      {result.scans_found && (
                        <div className="result-item">📁 Scans Found: <strong>{result.scans_found}</strong></div>
                      )}
                    </div>
                  )}
                  
                  {result.geminiInsights && (
                    <div className="gemini-insights">
                      <div className="insights-header">🧠 Gemini AI Insights</div>
                      <div className="insights-text">
                        {result.geminiInsights.substring(0, 500)}...
                      </div>
                      <details className="full-insights">
                        <summary>📖 Read Full Analysis</summary>
                        <div className="full-insights-text">{result.geminiInsights}</div>
                      </details>
                    </div>
                  )}

                  {result.reason && (
                    <div className="skip-reason">⏭️ {result.reason}</div>
                  )}
                  {result.error && (
                    <div className="error-reason">❌ {result.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {executionResult.logs && (
            <div className="execution-logs">
              <details>
                <summary>📝 Execution Logs ({executionResult.logs.length} entries)</summary>
                <div className="logs-content">
                  {executionResult.logs.map((log, idx) => (
                    <div key={idx} className="log-entry">
                      <span className="log-icon">{log.includes('✓') ? '✅' : log.includes('✗') ? '❌' : 'ℹ️'}</span>
                      {log}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          <div className="raw-json">
            <details>
              <summary>📋 Raw JSON Response</summary>
              <pre>{JSON.stringify(executionResult, null, 2)}</pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
