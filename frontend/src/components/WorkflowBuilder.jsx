import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import { BLOCK_LIBRARY } from './BlockLibrary'

export default function WorkflowBuilder(){
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [saved, setSaved] = useState([])
  const reactFlowWrapper = useRef(null)
  const [rfInstance, setRfInstance] = useState(null)
  const [lastSavedId, setLastSavedId] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('Untitled')
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedNodeData, setSelectedNodeData] = useState(null)
  const [blockConfigs, setBlockConfigs] = useState({})

  const updateBlockConfig = (nodeId, configKey, configValue) => {
    setBlockConfigs(prev => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] || {}), [configKey]: configValue }
    }))
    // Also update the node's config
    setNodes(ns => ns.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, config: { ...(n.data.config || {}), [configKey]: configValue } } }
        : n
    ))
  }

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, id: `e-${Date.now()}` }, eds)), [setEdges])

  useEffect(() => {
    loadSaved()
    return () => { delete window.__pendingWorkflowPayload }
  }, [])

  function addNode(item){
    const id = `${item.id}_${Date.now()}`
    const node = {
      id,
      type: 'default',
      position: { x: 200 + Math.random() * 200, y: 80 + Math.random() * 200 },
      data: { label: item.label, type: item.id, config: {} },
    }
    setNodes((n) => [...n, node])
  }

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    if (!reactFlowWrapper.current || !rfInstance) return
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
    const data = event.dataTransfer.getData('application/reactflow')
    if (!data) return
    let parsed
    try { parsed = JSON.parse(data) } catch(e) { parsed = { id: data, label: data } }

    const position = rfInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const id = `${parsed.id || 'node'}_${Date.now()}`
    const node = {
      id,
      type: 'default',
      position,
      data: { label: parsed.label || parsed.id || 'Node', type: parsed.id, config: {} }
    }
    setNodes((nds) => nds.concat(node))
  }, [rfInstance, setNodes])

  function exportGraph(){
    const payload = { nodes, edges }
    const json = JSON.stringify(payload, null, 2)
    try { navigator.clipboard?.writeText(json) } catch(e){}
    setSaveName('Untitled')
    setShowSaveModal(true)
    window.__pendingWorkflowPayload = payload
    return
  }

  function confirmSave(){
    const payload = window.__pendingWorkflowPayload || { nodes, edges }
    const name = saveName || 'Untitled'
    fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, payload })
    }).then(async (r) => {
      setShowSaveModal(false)
      if (!r.ok) {
        const txt = await r.text()
        alert('Save failed: ' + txt)
        return
      }
      const data = await r.json()
      setLastSavedId(data.id)
      alert('Workflow saved with id: ' + data.id + '\nAlso copied JSON to clipboard')
      loadSaved()
    }).catch((e) => {
      setShowSaveModal(false)
      console.error('save error', e)
      alert('Save failed, see console')
    })
  }

  function loadSaved(){
    fetch('/api/workflows').then(r => r.json()).then(setSaved).catch(() => setSaved([]))
  }

  function loadWorkflow(id){
    if ((nodes && nodes.length) || (edges && edges.length)) {
      const ok = window.confirm('Loading a saved workflow will overwrite the current canvas. Continue?')
      if (!ok) return
    }
    fetch(`/api/workflow/${id}`).then(async (r) => {
      if (!r.ok) return alert('Failed to load')
      const data = await r.json()
      let p = data.payload
      if (typeof p === 'string') {
        try { p = JSON.parse(p) } catch(e) { /* ignore */ }
      }
      
      // Ensure all nodes have valid positions
      const validatedNodes = (p.nodes || []).map((node, idx) => ({
        ...node,
        position: node.position && node.position.x !== undefined && node.position.y !== undefined 
          ? node.position 
          : { x: 100 + (idx * 150), y: 50 + (idx * 100) },
        data: node.data || { label: 'Block', type: 'unknown', config: {} }
      }))
      
      setNodes(validatedNodes)
      setEdges(p.edges || [])
      setLastSavedId(id)
    }).catch((e) => { console.error(e); alert('Load failed') })
  }

  function updateNodeConfig(nodeId, newConfig) {
    setNodes((ns) => ns.map(n => 
      n.id === nodeId ? { ...n, data: { ...n.data, config: newConfig } } : n
    ))
    if (selectedNode?.id === nodeId) {
      setSelectedNode({...selectedNode, data: {...selectedNode.data, config: newConfig}})
      setSelectedNodeData(newConfig)
    }
  }

  const selectedBlockComponent = selectedNode ? 
    BLOCK_LIBRARY.find(b => b.id === selectedNode.data.type)?.component : null

  return (
    <div style={{ display:'flex', height:'80vh', border:'1px solid #334155', backgroundColor:'#0f172a' }}>
      {/* Palette */}
      <div style={{ width:220, padding:12, borderRight:'1px solid #334155', background:'#1e293b', overflow: 'auto' }}>
        <h3 style={{marginTop:0,color:'#e2e8f0'}}>Block Palette</h3>
        {BLOCK_LIBRARY.map(block => (
          <div key={block.id} style={{marginBottom:8}}>
            <div
              draggable
              onDragStart={(e)=>{ e.dataTransfer.setData('application/reactflow', JSON.stringify(block)); e.dataTransfer.effectAllowed='move' }}
            >
              <button onClick={()=>addNode(block)} style={{width:'100%', fontSize: 12, backgroundColor:'#334155', color:'#e2e8f0', border:'1px solid #475569', borderRadius:'4px', padding:'8px', cursor:'pointer'}}>{block.label}</button>
            </div>
          </div>
        ))}
        <div style={{marginTop:18}}>
          <button onClick={exportGraph} style={{width:'100%', fontSize: 12, fontWeight: 'bold', backgroundColor:'#0ea5e9', color:'white', border:'none', borderRadius:'4px', padding:'8px', cursor:'pointer'}}>Save Workflow</button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex:1, display:'flex' }}>
        <ReactFlowProvider>
          <div style={{ flex:1 }} ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes.map(n => ({...n, selected: selectedNode?.id === n.id}))}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(e, node) => {
                setSelectedNode(node)
                setSelectedNodeData(node.data.config)
              }}
              fitView
              onInit={(instance)=>setRfInstance(instance)}
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>

          {/* Configuration Panel */}
          <div style={{ width:320, padding:12, borderLeft:'1px solid #334155', background:'#1e293b', overflow: 'auto', color:'#e2e8f0' }}>
            <h3 style={{marginTop:0, color:'#0ea5e9'}}>⚙️ Block Configuration</h3>
            
            {!selectedNode && (
              <div style={{color: '#94a3b8', fontSize: 12}}>Click on a block to configure</div>
            )}
            
            {selectedNode && (
              <>
                <div style={{marginBottom: 12, padding: 10, background: '#0f172a', borderRadius: 4, border: '1px solid #334155'}}>
                  <div style={{fontSize: 12, fontWeight: 'bold', marginBottom: 4, color:'#0ea5e9'}}>{selectedNode.data.label}</div>
                  <div style={{fontSize: 11, color: '#64748b'}}>Block ID: {selectedNode.id}</div>
                </div>

                {/* Notification Block Config */}
                {selectedNode.data.type === 'notify' && (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>📧 Email Recipients</label>
                      <input 
                        type="text" 
                        placeholder="doctor@hospital.com, admin@hospital.com"
                        value={blockConfigs[selectedNode.id]?.email_recipients || ''}
                        onChange={(e) => updateBlockConfig(selectedNode.id, 'email_recipients', e.target.value)}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12}}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>📱 SMS Recipients</label>
                      <input 
                        type="text" 
                        placeholder="+1234567890, +0987654321"
                        value={blockConfigs[selectedNode.id]?.sms_recipients || ''}
                        onChange={(e) => updateBlockConfig(selectedNode.id, 'sms_recipients', e.target.value)}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12}}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>🚨 Priority</label>
                      <select 
                        value={blockConfigs[selectedNode.id]?.priority || 'normal'}
                        onChange={(e) => updateBlockConfig(selectedNode.id, 'priority', e.target.value)}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12}}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="critical">Critical 🚑</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>📨 Channels</label>
                      <div style={{marginTop:4,display:'flex',gap:8}}>
                        <label style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                          <input 
                            type="checkbox" 
                            checked={(blockConfigs[selectedNode.id]?.channels || []).includes('email')}
                            onChange={(e) => {
                              const channels = blockConfigs[selectedNode.id]?.channels || [];
                              if (e.target.checked) {
                                updateBlockConfig(selectedNode.id, 'channels', [...channels, 'email']);
                              } else {
                                updateBlockConfig(selectedNode.id, 'channels', channels.filter(c => c !== 'email'));
                              }
                            }}
                          />
                          <span>Email</span>
                        </label>
                        <label style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                          <input 
                            type="checkbox" 
                            checked={(blockConfigs[selectedNode.id]?.channels || []).includes('sms')}
                            onChange={(e) => {
                              const channels = blockConfigs[selectedNode.id]?.channels || [];
                              if (e.target.checked) {
                                updateBlockConfig(selectedNode.id, 'channels', [...channels, 'sms']);
                              } else {
                                updateBlockConfig(selectedNode.id, 'channels', channels.filter(c => c !== 'sms'));
                              }
                            }}
                          />
                          <span>SMS</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Block Config */}
                {selectedNode.data.type === 'billing' && (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>💳 Line Items</label>
                      <textarea 
                        placeholder="consultation&#10;imaging&#10;medication&#10;lab work"
                        value={blockConfigs[selectedNode.id]?.line_items_text || ''}
                        onChange={(e) => {
                          const items = e.target.value.split('\n').filter(item => item.trim());
                          updateBlockConfig(selectedNode.id, 'line_items', items);
                          updateBlockConfig(selectedNode.id, 'line_items_text', e.target.value);
                        }}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12,minHeight:80,fontFamily:'monospace'}}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>📊 Tax Rate %</label>
                      <input 
                        type="number" 
                        placeholder="10"
                        value={blockConfigs[selectedNode.id]?.tax_rate || '10'}
                        onChange={(e) => updateBlockConfig(selectedNode.id, 'tax_rate', parseFloat(e.target.value))}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12}}
                      />
                    </div>
                  </div>
                )}

                {/* AI Block Config */}
                {selectedNode.data.type === 'ai' && (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>🤖 Model</label>
                      <select 
                        value={blockConfigs[selectedNode.id]?.model_name || 'ResNet50'}
                        onChange={(e) => updateBlockConfig(selectedNode.id, 'model_name', e.target.value)}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12}}
                      >
                        <option>ResNet50</option>
                        <option>VGG16</option>
                        <option>MobileNet</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>✅ Confidence Threshold</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        placeholder="0.7"
                        value={blockConfigs[selectedNode.id]?.confidence_threshold || '0.7'}
                        onChange={(e) => updateBlockConfig(selectedNode.id, 'confidence_threshold', parseFloat(e.target.value))}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12}}
                      />
                    </div>
                  </div>
                )}

                {/* Graph Block Config */}
                {selectedNode.data.type === 'graph' && (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>📈 Chart Type</label>
                      <select 
                        value={blockConfigs[selectedNode.id]?.chart_type || 'line'}
                        onChange={(e) => updateBlockConfig(selectedNode.id, 'chart_type', e.target.value)}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12}}
                      >
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:'#0ea5e9'}}>📊 Metrics</label>
                      <textarea 
                        placeholder="total_cost&#10;patient_load&#10;resources_used"
                        value={blockConfigs[selectedNode.id]?.metrics_text || ''}
                        onChange={(e) => {
                          const metrics = e.target.value.split('\n').filter(m => m.trim());
                          updateBlockConfig(selectedNode.id, 'metrics', metrics);
                          updateBlockConfig(selectedNode.id, 'metrics_text', e.target.value);
                        }}
                        style={{width:'100%',padding:8,marginTop:4,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#e2e8f0',fontSize:12,minHeight:80,fontFamily:'monospace'}}
                      />
                    </div>
                  </div>
                )}

                {!['notify', 'billing', 'ai', 'graph'].includes(selectedNode.data.type) && (
                  <div style={{color: '#64748b', fontSize: 12, padding: 8, background: '#0f172a', borderRadius: 4, border: '1px solid #334155'}}>
                    ℹ️ This block uses default settings
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    setNodes((ns) => ns.filter(n => n.id !== selectedNode.id))
                    setSelectedNode(null)
                    setSelectedNodeData(null)
                  }}
                  style={{width: '100%', marginTop: 12, padding: 8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize:12, fontWeight:600}}
                >
                  🗑️ Delete Block
                </button>
              </>
            )}
          </div>
        </ReactFlowProvider>
      </div>

      {/* Saved Workflows Sidebar */}
      <div style={{ width:280, padding:12, borderLeft:'1px solid #eee', background:'#fff' }}>
        <h3 style={{marginTop:0}}>Saved Workflows</h3>
        <div style={{marginBottom:8, fontSize: 12}}>Click Load to load a workflow.</div>
        {lastSavedId && <div style={{marginBottom:8,color:'#086', fontSize: 12}}>Last saved id: {lastSavedId}</div>}
        <div>
          <button onClick={loadSaved} style={{marginBottom:8, fontSize: 12}}>Refresh</button>
        </div>
        <div style={{maxHeight:420, overflow:'auto'}}>
          {saved.length === 0 && <div style={{color:'#666', fontSize: 12}}>No saved workflows</div>}
          {saved.map(s => (
            <div key={s.id} style={{padding:8,borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600, fontSize: 12}}>{s.name || `Workflow ${s.id}`}</div>
                <div style={{fontSize:11,color:'#666'}}>{new Date(s.created_at).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={()=>loadWorkflow(s.id)} style={{fontSize: 11}}>Load</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSaveModal && (
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)'}}>
          <div style={{width:420,background:'#fff',padding:18,borderRadius:6}}>
            <h3 style={{marginTop:0}}>Save Workflow</h3>
            <div style={{marginBottom:8}}>Give this workflow a name and click Save.</div>
            <input value={saveName} onChange={(e)=>setSaveName(e.target.value)} style={{width:'100%',padding:8,marginBottom:12}} />
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>setShowSaveModal(false)}>Cancel</button>
              <button onClick={confirmSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
