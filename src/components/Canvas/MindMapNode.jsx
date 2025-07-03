import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from 'reactflow';
import { 
  Brain, 
  Search, 
  FileText, 
  HelpCircle, 
  Target, 
  ExternalLink,
  Edit3,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

const nodeIcons = {
  root: Target,
  concept: Brain,
  finding: Search,
  question: HelpCircle,
  source: FileText
};

const nodeColors = {
  root: 'from-purple-500 to-pink-500',
  concept: 'from-blue-500 to-indigo-500',
  finding: 'from-green-500 to-emerald-500',
  question: 'from-yellow-500 to-orange-500',
  source: 'from-gray-500 to-slate-500'
};

export function MindMapNode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(data.label);
  const [showActions, setShowActions] = useState(false);
  
  const IconComponent = nodeIcons[data.nodeType] || Brain;
  const colorClass = nodeColors[data.nodeType] || nodeColors.concept;

  const handleSave = useCallback(() => {
    if (editedLabel.trim() && editedLabel !== data.label) {
      data.onUpdate({ label: editedLabel.trim() });
    }
    setIsEditing(false);
  }, [editedLabel, data]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedLabel(data.label);
      setIsEditing(false);
    }
  }, [handleSave, data.label]);

  const handleDelete = useCallback(() => {
    data.onDelete();
  }, [data]);

  return (
    <motion.div
      className={`
        relative group
        ${selected ? 'ring-2 ring-blue-400 ring-opacity-60' : ''}
      `}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
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

      {/* Node Content */}
      <div className={`
        relative min-w-[200px] max-w-[300px] p-4 rounded-xl
        bg-gradient-to-br ${colorClass}
        shadow-lg hover:shadow-xl transition-all duration-200
        border border-white/20
      `}>
        {/* Node Icon */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          
          {/* Node Title */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editedLabel}
                onChange={(e) => setEditedLabel(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSave}
                className="w-full bg-white/20 text-white placeholder-white/60 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30"
                autoFocus
              />
            ) : (
              <h3 
                className="text-white font-semibold text-sm leading-tight cursor-pointer hover:text-white/80"
                onClick={() => setIsEditing(true)}
              >
                {data.label}
              </h3>
            )}
          </div>
        </div>

        {/* Node Content */}
        {data.content && (
          <div className="mt-3 text-white/80 text-xs leading-relaxed">
            {data.content.length > 100 
              ? `${data.content.substring(0, 100)}...` 
              : data.content
            }
          </div>
        )}

        {/* Metadata */}
        {data.metadata && (
          <div className="mt-2 flex items-center justify-between text-white/60 text-xs">
            {data.metadata.confidence && (
              <span>Confidence: {Math.round(data.metadata.confidence * 100)}%</span>
            )}
            {data.metadata.timestamp && (
              <span>{new Date(data.metadata.timestamp).toLocaleTimeString()}</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="absolute -top-2 -right-2 flex gap-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => setIsEditing(true)}
            className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={handleDelete}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}