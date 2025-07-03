import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from 'reactflow';
import { 
  Edit3, 
  Move, 
  Maximize2, 
  Minimize2, 
  X,
  Palette,
  Type,
  Square,
  Circle,
  FileText,
  Pen,
  MousePointer,
  Save,
  Image,
  Link,
  Bold,
  Italic,
  List,
  Hash
} from 'lucide-react';

export function FloatingCanvasPage({ data, selected }) {
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const [tool, setTool] = useState('text');
  const [isMinimized, setIsMinimized] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);
  const svgRef = useRef(null);

  const handleSave = () => {
    if (data.onUpdate) {
      data.onUpdate({ content, paths });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      setContent(data.content || '');
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete();
    }
  };

  // Drawing functions
  const startDrawing = (e) => {
    if (!drawingMode) return;
    setIsDrawing(true);
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath(`M ${x} ${y}`);
  };

  const draw = (e) => {
    if (!isDrawing || !drawingMode) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath(prev => `${prev} L ${x} ${y}`);
  };

  const stopDrawing = () => {
    if (isDrawing && currentPath) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath('');
    }
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    setPaths([]);
    setCurrentPath('');
  };

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Enable editing on single click
  const handleContentClick = () => {
    if (!isEditing && !drawingMode) {
      setIsEditing(true);
    }
  };

  // Format text functions
  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <motion.div
      className={`
        relative bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 group
        ${selected ? 'ring-2 ring-blue-400 ring-opacity-60' : ''}
        ${drawingMode ? 'cursor-crosshair' : 'cursor-default'}
      `}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        height: isMinimized ? 'auto' : undefined
      }}
      transition={{ duration: 0.3 }}
      style={{
        minWidth: 500,
        minHeight: isMinimized ? 'auto' : 400,
        maxWidth: 800,
        maxHeight: 600
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Title Bar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg cursor-move">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <FileText className="w-4 h-4 text-gray-400 ml-2" />
          <span className="text-white font-medium text-sm">{data.label}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-6 h-6 hover:bg-gray-700 rounded flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={handleDelete}
            className="w-6 h-6 hover:bg-red-600 rounded flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-2 bg-gray-700/50 border-b border-gray-700 flex-wrap">
            {/* Mode Buttons */}
            <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
              <button
                onClick={() => {
                  setTool('text');
                  setDrawingMode(false);
                  setIsEditing(true);
                }}
                className={`p-2 rounded ${tool === 'text' && !drawingMode ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'} transition-colors`}
                title="Text Mode"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setTool('draw');
                  setDrawingMode(true);
                  setIsEditing(false);
                }}
                className={`p-2 rounded ${drawingMode ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'} transition-colors`}
                title="Draw Mode"
              >
                <Pen className="w-4 h-4" />
              </button>
            </div>

            {/* Text Formatting (only show in text mode) */}
            {!drawingMode && (
              <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                <button
                  onClick={() => insertText('**', '**')}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                  title="Bold"
                >
                  <Bold className="w-3 h-3" />
                </button>
                <button
                  onClick={() => insertText('*', '*')}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                  title="Italic"
                >
                  <Italic className="w-3 h-3" />
                </button>
                <button
                  onClick={() => insertText('# ', '')}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                  title="Heading"
                >
                  <Hash className="w-3 h-3" />
                </button>
                <button
                  onClick={() => insertText('- ', '')}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                  title="List"
                >
                  <List className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Drawing Controls (only show in draw mode) */}
            {drawingMode && (
              <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                <button
                  onClick={clearDrawing}
                  className="px-2 py-1 rounded text-xs bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Save Button */}
            <div className="ml-auto">
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                    setDrawingMode(false);
                  }
                }}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative h-80 overflow-hidden">
            {/* Text Content */}
            <div 
              className="absolute inset-4 z-10"
              onClick={handleContentClick}
            >
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSave}
                  placeholder="Start typing your thoughts, notes, or ideas...

# Heading
**Bold text** and *italic text*
- List items
- More items

Click the pen icon to draw!"
                  className="w-full h-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed font-mono"
                  style={{ minHeight: '100%' }}
                />
              ) : (
                <div className="w-full h-full overflow-auto">
                  {content ? (
                    <div className="text-white text-sm leading-relaxed whitespace-pre-wrap cursor-text">
                      {content}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm cursor-text">
                      Click to start writing...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawing Canvas */}
            <svg
              ref={svgRef}
              className="absolute inset-4 w-full h-full pointer-events-auto"
              style={{ 
                display: drawingMode || paths.length > 0 ? 'block' : 'none',
                zIndex: drawingMode ? 20 : 5
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            >
              {/* Existing paths */}
              {paths.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {/* Current drawing path */}
              {currentPath && (
                <path
                  d={currentPath}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>

          {/* AI Analysis Suggestion */}
          {(content || paths.length > 0) && !isEditing && !drawingMode && (
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-300">
                  AI Suggestion: This content could be analyzed and linked to your research nodes
                </span>
                <button className="ml-auto px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors">
                  Analyze
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Resize Handle */}
      {!isMinimized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-600 hover:bg-gray-500 transition-colors"
          style={{
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
          }}
          onMouseDown={() => setIsResizing(true)}
        />
      )}
    </motion.div>
  );
}