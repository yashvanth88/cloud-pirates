import React from 'react'

/**
 * Complete block library for the workflow builder
 * Each block is a reusable component that can be dragged onto the canvas
 */

// EMR Block - Create/Select/Edit EMR records with form fields
export const EMRBlock = ({ config, onConfig }) => {
  const [fields, setFields] = React.useState(config?.fields || ['patient_name', 'age', 'gender', 'admission_date', 'medical_history'])
  
  return (
    <div style={{padding: 12, border: '1px solid #4a90e2', borderRadius: 6, background: '#f0f4ff'}}>
      <h4 style={{margin: '0 0 8px 0'}}>EMR Block</h4>
      <div style={{fontSize: 12, color: '#555', marginBottom: 10}}>
        <label>
          <input type="checkbox" checked={config?.required_only} onChange={(e) => onConfig?.({...config, required_only: e.target.checked})} />
          Required fields only
        </label>
      </div>
      <div>
        <label style={{fontSize: 11, color: '#666'}}>Fields:</label>
        <div style={{fontSize: 11, marginTop: 4, padding: 6, background: '#fff', borderRadius: 3, minHeight: 60, maxHeight: 120, overflow: 'auto'}}>
          {fields.map(f => <div key={f}>{f}</div>)}
        </div>
      </div>
      <button style={{marginTop: 8, fontSize: 11}} onClick={() => {
        const newField = prompt('Add field (e.g., diagnosis, treatment):');
        if (newField) setFields([...fields, newField]);
      }}>+ Add Field</button>
    </div>
  )
}

// Inventory Block - Manage hospital resources (beds, supplies, equipment)
export const InventoryBlock = ({ config, onConfig }) => {
  const [items, setItems] = React.useState(config?.items || ['beds', 'medical_supplies', 'equipment', 'medication'])
  const [autoAlert, setAutoAlert] = React.useState(config?.auto_alert_threshold || 20)
  
  return (
    <div style={{padding: 12, border: '1px solid #e2964a', borderRadius: 6, background: '#fff9f0'}}>
      <h4 style={{margin: '0 0 8px 0'}}>Inventory Block</h4>
      <div style={{fontSize: 12, marginBottom: 8}}>
        <label>
          Auto-alert when stock &lt;
          <input type="number" value={autoAlert} onChange={(e) => {
            setAutoAlert(e.target.value);
            onConfig?.({...config, auto_alert_threshold: e.target.value});
          }} style={{width: 50, marginLeft: 6}} />%
        </label>
      </div>
      <div>
        <label style={{fontSize: 11, color: '#666'}}>Tracked Items:</label>
        <div style={{fontSize: 11, marginTop: 4, padding: 6, background: '#fff', borderRadius: 3, minHeight: 60, maxHeight: 120, overflow: 'auto'}}>
          {items.map(i => <div key={i}>• {i}</div>)}
        </div>
      </div>
      <button style={{marginTop: 8, fontSize: 11}} onClick={() => {
        const newItem = prompt('Add item to track:');
        if (newItem) setItems([...items, newItem]);
      }}>+ Add Item</button>
    </div>
  )
}

// Storage Block - Choose cloud or on-premise storage with encryption
export const StorageBlock = ({ config, onConfig }) => {
  const storage_type = config?.storage_type || 'cloud'
  const encryption = config?.encryption || 'AES-256'
  const sensitive = config?.sensitive_data || false
  
  return (
    <div style={{padding: 12, border: '1px solid #7b68ee', borderRadius: 6, background: '#f8f0ff'}}>
      <h4 style={{margin: '0 0 8px 0'}}>Storage Block</h4>
      <div style={{fontSize: 12, marginBottom: 10}}>
        <label>
          <input type="radio" value="cloud" checked={storage_type === 'cloud'} onChange={(e) => onConfig?.({...config, storage_type: e.target.value})} />
          Cloud (S3/MinIO)
        </label>
        <br/>
        <label>
          <input type="radio" value="on_premise" checked={storage_type === 'on_premise'} onChange={(e) => onConfig?.({...config, storage_type: e.target.value})} />
          On-Premise (PostgreSQL)
        </label>
      </div>
      <div style={{fontSize: 12, marginBottom: 8}}>
        <label>
          <input type="checkbox" checked={sensitive} onChange={(e) => onConfig?.({...config, sensitive_data: e.target.checked})} />
          Sensitive Data (will be encrypted)
        </label>
      </div>
      <div style={{fontSize: 11}}>
        <label>Encryption:
          <select value={encryption} onChange={(e) => onConfig?.({...config, encryption: e.target.value})} style={{marginLeft: 8, fontSize: 11}}>
            <option>AES-256</option>
            <option>TLS 1.3</option>
            <option>End-to-End</option>
          </select>
        </label>
      </div>
    </div>
  )
}

// Scan Upload Block - Upload medical scans (X-ray, MRI, CT)
export const ScanUploadBlock = ({ config, onConfig }) => {
  const [formats, setFormats] = React.useState(config?.formats || ['jpeg', 'png', 'dicom'])
  const max_size_mb = config?.max_size_mb || 50
  
  return (
    <div style={{padding: 12, border: '1px solid #20a39e', borderRadius: 6, background: '#f0fffe'}}>
      <h4 style={{margin: '0 0 8px 0'}}>Scan Upload Block</h4>
      <div style={{fontSize: 12, marginBottom: 8}}>
        <label>Max size (MB):
          <input type="number" value={max_size_mb} onChange={(e) => onConfig?.({...config, max_size_mb: e.target.value})} style={{width: 60, marginLeft: 8}} />
        </label>
      </div>
      <div style={{fontSize: 11, marginBottom: 8}}>Allowed formats:</div>
      {['jpeg', 'png', 'dicom', 'nifti'].map(fmt => (
        <label key={fmt} style={{fontSize: 11, marginRight: 12}}>
          <input type="checkbox" checked={formats.includes(fmt)} onChange={(e) => {
            const newFormats = e.target.checked ? [...formats, fmt] : formats.filter(f => f !== fmt);
            setFormats(newFormats);
            onConfig?.({...config, formats: newFormats});
          }} />
          {fmt.toUpperCase()}
        </label>
      ))}
    </div>
  )
}

// AI Engine Block - Process scans with inference
export const AIEngineBlock = ({ config, onConfig }) => {
  const model_name = config?.model_name || 'ResNet50'
  const confidence_threshold = config?.confidence_threshold || 0.7
  const auto_report = config?.auto_report || false
  
  return (
    <div style={{padding: 12, border: '1px solid #e85d75', borderRadius: 6, background: '#ffe8ef'}}>
      <h4 style={{margin: '0 0 8px 0'}}>AI Engine Block</h4>
      <div style={{fontSize: 12, marginBottom: 10}}>
        <label>Model:
          <select value={model_name} onChange={(e) => onConfig?.({...config, model_name: e.target.value})} style={{marginLeft: 8, fontSize: 11}}>
            <option>ResNet50</option>
            <option>VGG16</option>
            <option>YOLO-v8</option>
            <option>CheXNet</option>
            <option>Custom Model</option>
          </select>
        </label>
      </div>
      <div style={{fontSize: 12, marginBottom: 8}}>
        <label>Confidence threshold:
          <input type="range" min="0" max="1" step="0.1" value={confidence_threshold} onChange={(e) => onConfig?.({...config, confidence_threshold: parseFloat(e.target.value)})} style={{marginLeft: 8, width: 100}} />
          <span style={{marginLeft: 8}}>{Math.round(confidence_threshold * 100)}%</span>
        </label>
      </div>
      <div style={{fontSize: 12}}>
        <label>
          <input type="checkbox" checked={auto_report} onChange={(e) => onConfig?.({...config, auto_report: e.target.checked})} />
          Auto-generate report
        </label>
      </div>
    </div>
  )
}

// Billing Block - Generate bills and invoices
export const BillingBlock = ({ config, onConfig }) => {
  const [items, setItems] = React.useState(config?.line_items || ['consultation', 'scan_processing', 'medication', 'room_charges'])
  const tax_rate = config?.tax_rate || 10
  
  return (
    <div style={{padding: 12, border: '1px solid #2ecc71', borderRadius: 6, background: '#f0fdf4'}}>
      <h4 style={{margin: '0 0 8px 0'}}>Billing Block</h4>
      <div style={{fontSize: 12, marginBottom: 10}}>
        <label>Tax rate:
          <input type="number" value={tax_rate} onChange={(e) => onConfig?.({...config, tax_rate: e.target.value})} style={{width: 50, marginLeft: 8}} />%
        </label>
      </div>
      <div style={{fontSize: 11, marginBottom: 8}}>Line items:</div>
      <div style={{fontSize: 11, padding: 6, background: '#fff', borderRadius: 3, minHeight: 60, maxHeight: 120, overflow: 'auto'}}>
        {items.map(i => <div key={i}>• {i}</div>)}
      </div>
      <button style={{marginTop: 8, fontSize: 11}} onClick={() => {
        const newItem = prompt('Add billable item:');
        if (newItem) setItems([...items, newItem]);
      }}>+ Add Item</button>
    </div>
  )
}

// Notification Block - Send alerts to doctors/staff
export const NotificationBlock = ({ config, onConfig }) => {
  const [channels, setChannels] = React.useState(config?.channels || ['email', 'sms'])
  const priority = config?.priority || 'normal'
  
  return (
    <div style={{padding: 12, border: '1px solid #f39c12', borderRadius: 6, background: '#fffbf0'}}>
      <h4 style={{margin: '0 0 8px 0'}}>Notification Block</h4>
      <div style={{fontSize: 12, marginBottom: 10}}>
        <label>Priority:
          <select value={priority} onChange={(e) => onConfig?.({...config, priority: e.target.value})} style={{marginLeft: 8, fontSize: 11}}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
      </div>
      <div style={{fontSize: 11, marginBottom: 8}}>Channels:</div>
      {['email', 'sms', 'push', 'in_app'].map(ch => (
        <label key={ch} style={{fontSize: 11, marginRight: 12}}>
          <input type="checkbox" checked={channels.includes(ch)} onChange={(e) => {
            const newChannels = e.target.checked ? [...channels, ch] : channels.filter(c => c !== ch);
            setChannels(newChannels);
            onConfig?.({...config, channels: newChannels});
          }} />
          {ch.replace('_', ' ').toUpperCase()}
        </label>
      ))}
    </div>
  )
}

// Graph Block - Plot analytics and business insights
export const GraphBlock = ({ config, onConfig }) => {
  const [metrics, setMetrics] = React.useState(config?.metrics || ['total_cost', 'resources_used', 'patient_load', 'revenue'])
  const chart_type = config?.chart_type || 'line'
  
  return (
    <div style={{padding: 12, border: '1px solid #3498db', borderRadius: 6, background: '#f0f8ff'}}>
      <h4 style={{margin: '0 0 8px 0'}}>Graph Block</h4>
      <div style={{fontSize: 12, marginBottom: 10}}>
        <label>Chart type:
          <select value={chart_type} onChange={(e) => onConfig?.({...config, chart_type: e.target.value})} style={{marginLeft: 8, fontSize: 11}}>
            <option>line</option>
            <option>bar</option>
            <option>pie</option>
            <option>area</option>
            <option>scatter</option>
          </select>
        </label>
      </div>
      <div style={{fontSize: 11, marginBottom: 8}}>Metrics to plot:</div>
      <div style={{fontSize: 11, padding: 6, background: '#fff', borderRadius: 3, minHeight: 60, maxHeight: 120, overflow: 'auto'}}>
        {metrics.map(m => <div key={m}>• {m.replace('_', ' ')}</div>)}
      </div>
      <button style={{marginTop: 8, fontSize: 11}} onClick={() => {
        const newMetric = prompt('Add metric to track:');
        if (newMetric) setMetrics([...metrics, newMetric]);
      }}>+ Add Metric</button>
    </div>
  )
}

// API Connector Block - Connect to external systems
export const APIConnectorBlock = ({ config, onConfig }) => {
  const method = config?.method || 'POST'
  const url = config?.url || ''
  
  return (
    <div style={{padding: 12, border: '1px solid #9b59b6', borderRadius: 6, background: '#faf0ff'}}>
      <h4 style={{margin: '0 0 8px 0'}}>API Connector</h4>
      <div style={{fontSize: 12, marginBottom: 10}}>
        <label>Method:
          <select value={method} onChange={(e) => onConfig?.({...config, method: e.target.value})} style={{marginLeft: 8, fontSize: 11}}>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
        </label>
      </div>
      <div style={{fontSize: 12}}>
        <label>URL:
          <input type="text" value={url} onChange={(e) => onConfig?.({...config, url: e.target.value})} style={{width: '100%', marginTop: 4, padding: 4, fontSize: 11}} placeholder="https://api.example.com/endpoint" />
        </label>
      </div>
    </div>
  )
}

// Export all blocks for use in palette
export const BLOCK_LIBRARY = [
  { id: 'emr', label: 'EMR Form', component: EMRBlock },
  { id: 'inventory', label: 'Inventory', component: InventoryBlock },
  { id: 'storage', label: 'Storage', component: StorageBlock },
  { id: 'upload', label: 'Scan Upload', component: ScanUploadBlock },
  { id: 'ai', label: 'AI Engine', component: AIEngineBlock },
  { id: 'billing', label: 'Billing', component: BillingBlock },
  { id: 'notify', label: 'Notification', component: NotificationBlock },
  { id: 'graph', label: 'Analytics', component: GraphBlock },
  { id: 'api', label: 'API Connector', component: APIConnectorBlock },
]
