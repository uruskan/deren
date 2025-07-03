import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MindMapNode } from './MindMapNode';
import { FloatingCanvasPage } from './FloatingCanvasPage';
import { Plus, Target, Brain, Search, FileText, Link, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = {
  mindMapNode: MindMapNode,
  floatingCanvas: FloatingCanvasPage
};

export function MindMapCanvas({ 
  nodes: mindMapNodes, 
  connections, 
  onNodeUpdate, 
  onNodeDelete,
  onConnectionCreate,
  onCanvasPageCreate,
  isAgentActive,
  agentStatus 
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const canvasRef = useRef(null);

  // Convert mind map nodes to ReactFlow format
  useEffect(() => {
    const flowNodes = mindMapNodes.map(node => ({
      id: node.id,
      type: node.type === 'canvas' ? 'floatingCanvas' : 'mindMapNode',
      position: node.position,
      data: {
        label: node.label,
        content: node.content,
        nodeType: node.type,
        metadata: node.metadata,
        onUpdate: (updates) => onNodeUpdate({ ...node, ...updates }),
        onDelete: () => onNodeDelete(node.id)
      },
      // Make canvas pages larger and draggable
      style: node.type === 'canvas' ? {
        width: 500,
        height: 400,
        zIndex: 10
      } : undefined,
      draggable: true,
      selectable: true
    }));
    setNodes(flowNodes);
  }, [mindMapNodes, onNodeUpdate, onNodeDelete, setNodes]);

  // Convert connections to ReactFlow edges
  useEffect(() => {
    const flowEdges = connections.map(conn => ({
      id: conn.id,
      source: conn.from,
      target: conn.to,
      type: 'smoothstep',
      animated: conn.type === 'relates_to',
      style: {
        stroke: getConnectionColor(conn.type),
        strokeWidth: Math.max(1, conn.strength * 3),
        opacity: 0.8
      },
      label: conn.type.replace('_', ' '),
      labelStyle: { 
        fontSize: 10, 
        fontWeight: 600,
        fill: '#64748b'
      }
    }));
    setEdges(flowEdges);
  }, [connections, setEdges]);

  const getConnectionColor = (type) => {
    switch (type) {
      case 'supports': return '#10b981';
      case 'contradicts': return '#ef4444';
      case 'depends_on': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const onConnect = useCallback((params) => {
    const newConnection = {
      id: `conn_${params.source}_${params.target}`,
      from: params.source,
      to: params.target,
      type: 'relates_to',
      strength: 1.0
    };
    onConnectionCreate(newConnection);
    setEdges((eds) => addEdge(params, eds));
  }, [onConnectionCreate, setEdges]);

  const handlePaneContextMenu = useCallback((event) => {
    event.preventDefault();
    
    if (reactFlowInstance) {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      setShowContextMenu({
        x: event.clientX,
        y: event.clientY,
        flowPosition: position
      });
    }
  }, [reactFlowInstance]);

  const handleCreateCanvasPage = useCallback(() => {
    if (showContextMenu && showContextMenu.flowPosition) {
      console.log('Creating canvas page at position:', showContextMenu.flowPosition);
      
      // Create the new canvas page node
      const newCanvasPage = {
        id: `canvas-${uuidv4()}`,
        label: `Canvas Page ${Date.now()}`,
        type: 'canvas',
        position: showContextMenu.flowPosition,
        content: '',
        metadata: {
          timestamp: new Date().toISOString(),
          confidence: 1.0,
          tags: []
        }
      };
      
      // Call the parent's create function
      onCanvasPageCreate(newCanvasPage.position, newCanvasPage);
      setShowContextMenu(null);
    }
  }, [showContextMenu, onCanvasPageCreate]);

  const handleCreateResearchNode = useCallback(() => {
    if (showContextMenu && showContextMenu.flowPosition) {
      const newNode = {
        id: `node-${uuidv4()}`,
        label: 'New Research Node',
        type: 'concept',
        position: showContextMenu.flowPosition,
        content: 'Click to edit this research node',
        metadata: {
          timestamp: new Date().toISOString(),
          confidence: 1.0,
          tags: []
        }
      };
      
      onCanvasPageCreate(newNode.position, newNode);
      setShowContextMenu(null);
    }
  }, [showContextMenu, onCanvasPageCreate]);

  const handleCloseContextMenu = useCallback(() => {
    setShowContextMenu(null);
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  useEffect(() => {
    if (showContextMenu) {
      document.addEventListener('click', handleCloseContextMenu);
      return () => document.removeEventListener('click', handleCloseContextMenu);
    }
  }, [showContextMenu, handleCloseContextMenu]);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        ref={canvasRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-950"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        panOnScrollSpeed={0.5}
        zoomOnDoubleClick={false}
      >
        <Background 
          color="#1e293b" 
          gap={20} 
          size={1}
          variant="dots"
        />
        <Controls 
          className="bg-gray-800/80 backdrop-blur-sm border border-gray-700"
        />
        <MiniMap 
          className="bg-gray-800/80 backdrop-blur-sm border border-gray-700"
          nodeColor={(node) => {
            if (node.type === 'floatingCanvas') return '#8b5cf6'; // Purple for canvas pages
            return '#3b82f6'; // Blue for regular nodes
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
        
        {/* Instructions Panel */}
        <Panel position="top-left" className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-w-sm">
          <div className="text-white">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              DEREN Canvas
            </h3>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• Right-click to create pages</div>
              <div>• Drag nodes to move them</div>
              <div>• Connect nodes by dragging handles</div>
              <div>• Click canvas pages to edit</div>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Agent Status Overlay */}
      <AnimatePresence>
        {isAgentActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-w-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
              >
                <Brain className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-white font-semibold">DEREN Active</span>
            </div>
            <div className="text-sm text-gray-300">
              {agentStatus?.currentTask || 'Initializing research mission...'}
            </div>
            {agentStatus?.progress && (
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${agentStatus.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl"
            style={{
              left: showContextMenu.x,
              top: showContextMenu.y
            }}
          >
            <div className="p-2">
              <button
                onClick={handleCreateCanvasPage}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <FileText className="w-4 h-4" />
                Create Canvas Page
              </button>
              <button
                onClick={handleCreateResearchNode}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <Brain className="w-4 h-4" />
                Add Research Node
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Message */}
      {mindMapNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-6 max-w-md text-center">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Welcome to DEREN</h3>
            <p className="text-gray-300 text-sm mb-4">
              Right-click anywhere to create a canvas page, or use the terminal to start a research mission.
            </p>
            <div className="text-xs text-gray-400">
              Try: "research artificial intelligence trends"
            </div>
          </div>
        </div>
      )}
    </div>
  );
}