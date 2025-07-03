import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Send, 
  History, 
  Minimize2, 
  Maximize2,
  X,
  ChevronRight,
  Brain,
  Loader
} from 'lucide-react';

export function CommandTerminal({ 
  onCommand, 
  isAgentActive, 
  agentHistory = [],
  isMinimized,
  onToggleMinimize,
  onClose 
}) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'DEREN v1.1 - Dynamic Exploration & Reasoning Entity for Notation', timestamp: new Date().toISOString() },
    { type: 'system', content: 'Type "help" for available commands or start with a research mission', timestamp: new Date().toISOString() }
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState([]);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  const suggestions = [
    'search "artificial intelligence trends 2024"',
    'analyze "impact of remote work on productivity"',
    'investigate "quantum computing applications"',
    'research "sustainable energy solutions"',
    'explore "space exploration technologies"',
    'help',
    'clear',
    'status'
  ];

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    if (input) {
      const filtered = suggestions.filter(cmd => 
        cmd.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && input.length > 1);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  useEffect(() => {
    if (agentHistory.length > 0) {
      const newEntries = agentHistory.map(task => ({
        type: 'agent',
        content: `[${task.status.toUpperCase()}] ${task.description}`,
        timestamp: task.timestamp,
        status: task.status
      }));
      
      setHistory(prev => {
        const filtered = prev.filter(entry => entry.type !== 'agent');
        return [...filtered, ...newEntries];
      });
    }
  }, [agentHistory]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    const newEntry = {
      type: 'user',
      content: command,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [...prev, newEntry]);
    setCommandHistory(prev => [command, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);

    // Handle built-in commands
    if (command.toLowerCase() === 'help') {
      setHistory(prev => [...prev, {
        type: 'system',
        content: `Available commands:
• search "query" - Search the web for information
• analyze "topic" - Deep analysis of a topic
• investigate "subject" - Comprehensive investigation
• research "field" - Broad research on a field
• explore "concept" - Explore a concept thoroughly
• clear - Clear terminal history
• status - Show agent status
• help - Show this help message`,
        timestamp: new Date().toISOString()
      }]);
    } else if (command.toLowerCase() === 'clear') {
      setHistory([
        { type: 'system', content: 'Terminal cleared', timestamp: new Date().toISOString() }
      ]);
    } else if (command.toLowerCase() === 'status') {
      setHistory(prev => [...prev, {
        type: 'system',
        content: `Agent Status: ${isAgentActive ? 'ACTIVE' : 'IDLE'}
Memory: ${agentHistory.length} tasks in history
Last Update: ${new Date().toLocaleString()}`,
        timestamp: new Date().toISOString()
      }]);
    } else {
      // Pass command to agent
      onCommand(command);
      setHistory(prev => [...prev, {
        type: 'system',
        content: `Executing command: ${command}`,
        timestamp: new Date().toISOString()
      }]);
    }

    setInput('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setInput(filteredSuggestions[0]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getEntryIcon = (type, status) => {
    switch (type) {
      case 'user':
        return <ChevronRight className="w-4 h-4 text-blue-400" />;
      case 'agent':
        return status === 'executing' 
          ? <Loader className="w-4 h-4 text-yellow-400 animate-spin" />
          : <Brain className="w-4 h-4 text-purple-400" />;
      default:
        return <Terminal className="w-4 h-4 text-green-400" />;
    }
  };

  const getEntryColor = (type, status) => {
    if (type === 'agent') {
      switch (status) {
        case 'completed': return 'text-green-300';
        case 'failed': return 'text-red-300';
        case 'executing': return 'text-yellow-300';
        default: return 'text-gray-300';
      }
    }
    return type === 'user' ? 'text-blue-300' : 'text-gray-300';
  };

  return (
    <motion.div
      className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl flex flex-col"
      initial={{ height: isMinimized ? 'auto' : 400 }}
      animate={{ height: isMinimized ? 'auto' : 400 }}
      transition={{ duration: 0.3 }}
      style={{ minWidth: 500, maxWidth: 800 }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <Terminal className="w-4 h-4 text-gray-400 ml-2" />
          <span className="text-white font-medium text-sm">DEREN Terminal</span>
          {isAgentActive && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">ACTIVE</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMinimize}
            className="w-6 h-6 hover:bg-gray-700 rounded flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 hover:bg-red-600 rounded flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Terminal Content */}
          <div 
            ref={terminalRef}
            className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-sm"
            style={{ height: 300 }}
          >
            <AnimatePresence>
              {history.map((entry, index) => (
                <motion.div
                  key={`${entry.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getEntryIcon(entry.type, entry.status)}
                  </div>
                  <div className={`flex-1 ${getEntryColor(entry.type, entry.status)}`}>
                    <div className="whitespace-pre-wrap break-words">
                      {entry.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Command Input */}
          <div className="relative border-t border-gray-700 bg-gray-800/30">
            {/* Auto-suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 bg-gray-800 border-l border-r border-gray-700 max-h-32 overflow-y-auto"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
              <ChevronRight className="w-4 h-4 text-green-400" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter DEREN command..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none font-mono text-sm"
                disabled={isAgentActive}
              />
              <button
                type="submit"
                disabled={!input.trim() || isAgentActive}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
}