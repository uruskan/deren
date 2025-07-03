import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MindMapCanvas } from './components/Canvas/MindMapCanvas';
import { CommandTerminal } from './components/Terminal/CommandTerminal';
import { AgentService } from './services/AgentService';
import { createMindMapNode, createConnection, NodeTypes } from './utils/types';
import { v4 as uuidv4 } from 'uuid';
import { Brain, Terminal, Settings, Save, Loader as Load, Download, Menu, X } from 'lucide-react';

function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [agentService] = useState(() => new AgentService());
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [agentHistory, setAgentHistory] = useState([]);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Initialize with demo content
  useEffect(() => {
    const demoNodes = [
      createMindMapNode(
        'demo-root',
        'DEREN Research System',
        NodeTypes.ROOT,
        { x: 0, y: 0 }, // Center the demo content
        'Your AI-powered research companion for deep investigation and knowledge synthesis'
      ),
      createMindMapNode(
        'demo-concept-1',
        'AI Research Agent',
        NodeTypes.CONCEPT,
        { x: -300, y: -200 },
        'Autonomous reasoning and task execution capabilities'
      ),
      createMindMapNode(
        'demo-concept-2',
        'Visual Mind Mapping',
        NodeTypes.CONCEPT,
        { x: 300, y: -200 },
        'Interactive knowledge graph visualization'
      ),
      createMindMapNode(
        'demo-finding-1',
        'Human-AI Collaboration',
        NodeTypes.FINDING,
        { x: 0, y: 250 },
        'Seamless integration of human intuition and AI analysis'
      )
    ];

    const demoConnections = [
      createConnection('demo-root', 'demo-concept-1', 'relates_to', 0.9),
      createConnection('demo-root', 'demo-concept-2', 'relates_to', 0.9),
      createConnection('demo-root', 'demo-finding-1', 'supports', 0.8),
      createConnection('demo-concept-1', 'demo-finding-1', 'supports', 0.7)
    ];

    setNodes(demoNodes);
    setConnections(demoConnections);
  }, []);

  const handleCommand = useCallback(async (command) => {
    try {
      setIsAgentActive(true);
      setAgentHistory([]);
      
      // Handle canvas page creation commands
      if (command.toLowerCase().includes('create canvas') || command.toLowerCase().includes('new page')) {
        const newPage = createMindMapNode(
          uuidv4(),
          'New Canvas Page',
          'canvas',
          { x: Math.random() * 400 + 200, y: Math.random() * 300 + 200 },
          ''
        );
        setNodes(prev => [...prev, newPage]);
        setIsAgentActive(false);
        return;
      }
      
      const result = await agentService.executeMission(command, (status) => {
        setAgentStatus(status);
      });

      // Add generated nodes and connections to the canvas
      if (result && result.nodes) {
        // Clear previous AI-generated nodes to prevent overlap
        setNodes(prev => [...prev.filter(n => !n.id.startsWith('ai-gen-')), ...result.nodes]);
        setConnections(prev => [...prev.filter(c => !c.id.startsWith('ai-gen-')), ...result.connections]);
      }

      // Update agent history
      const status = agentService.getStatus();
      setAgentHistory(status.taskQueue);
      
    } catch (error) {
      console.error('Command execution failed:', error);
    } finally {
      setIsAgentActive(false);
      setAgentStatus(null);
    }
  }, [agentService]);

  const handleNodeUpdate = useCallback((updatedNode) => {
    setNodes(prev => prev.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    ));
  }, []);

  const handleNodeDelete = useCallback((nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
  }, []);

  const handleConnectionCreate = useCallback((connection) => {
    setConnections(prev => [...prev, connection]);
  }, []);

  const handleCanvasPageCreate = useCallback((position, pageData = null) => {
    const newPage = pageData || createMindMapNode(
      uuidv4(),
      'Canvas Page',
      'canvas',
      position,
      ''
    );
    console.log('Creating new canvas page:', newPage);
    setNodes(prev => [...prev, newPage]);
  }, []);

  const handleSaveProject = useCallback(() => {
    const project = {
      nodes,
      connections,
      metadata: {
        version: '1.0',
        created: new Date().toISOString(),
        title: 'DEREN Project'
      }
    };
    
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deren-project.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, connections]);

  const handleLoadProject = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const project = JSON.parse(e.target?.result);
          if (project.nodes && project.connections) {
            setNodes(project.nodes);
            setConnections(project.connections);
          }
        } catch (error) {
          console.error('Failed to load project:', error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setConnections([]);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-950 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DEREN
              </h1>
              <p className="text-xs text-gray-400">Dynamic Exploration & Reasoning Entity</p>
            </div>
          </div>
          
          {isAgentActive && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Agent Active</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleLoadProject}
            className="hidden"
            id="load-project"
          />
          <label
            htmlFor="load-project"
            className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
            title="Load Project"
          >
            <Load className="w-5 h-5 text-gray-400" />
          </label>
          
          <button
            onClick={handleSaveProject}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Save Project"
          >
            <Save className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={handleClearCanvas}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Clear Canvas"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 relative">
        {/* Canvas */}
        <div className="flex-1 relative">
          <MindMapCanvas
            nodes={nodes}
            connections={connections}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onConnectionCreate={handleConnectionCreate}
            onCanvasPageCreate={handleCanvasPageCreate}
            isAgentActive={isAgentActive}
            agentStatus={agentStatus}
          />
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {(showSidebar || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute lg:relative top-0 right-0 w-full lg:w-96 h-full bg-gray-900/95 lg:bg-transparent backdrop-blur-sm border-l border-gray-700 z-20"
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h3 className="text-lg font-semibold">Control Panel</h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Terminal */}
                <div className="flex-1">
                  <CommandTerminal
                    onCommand={handleCommand}
                    isAgentActive={isAgentActive}
                    agentHistory={agentHistory}
                    isMinimized={isTerminalMinimized}
                    onToggleMinimize={() => setIsTerminalMinimized(!isTerminalMinimized)}
                  />
                </div>

                {/* Quick Stats */}
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Session Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nodes:</span>
                      <span className="text-white">{nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Connections:</span>
                      <span className="text-white">{connections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tasks:</span>
                      <span className="text-white">{agentHistory.length}</span>
                    </div>
                  </div>
                </div>

                {/* ChatGPT Integration Info */}
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">ChatGPT Integration</h4>
                  <p className="text-xs text-blue-200 mb-2">
                    Ready for ChatGPT "work with" feature integration
                  </p>
                  <div className="text-xs text-blue-300">
                    Status: <span className="text-green-400">Compatible</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCommand('research artificial intelligence')}
                      className="w-full text-left px-3 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded transition-colors"
                    >
                      Demo: AI Research
                    </button>
                    <button
                      onClick={() => handleCommand('analyze climate change')}
                      className="w-full text-left px-3 py-2 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded transition-colors"
                    >
                      Demo: Climate Analysis
                    </button>
                    <button
                      onClick={() => handleCommand('create canvas page')}
                      className="w-full text-left px-3 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded transition-colors"
                    >
                      Create Canvas Page
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;