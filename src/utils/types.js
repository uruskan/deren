// Core data structures for DEREN system

export const NodeTypes = {
  ROOT: 'root',
  CONCEPT: 'concept',
  FINDING: 'finding', 
  QUESTION: 'question',
  SOURCE: 'source',
  CANVAS: 'canvas'
};

export const TaskTypes = {
  SEARCH: 'search',
  ANALYZE: 'analyze',
  SUMMARIZE: 'summarize',
  EXTRACT: 'extract',
  LINK: 'link',
  CREATE_NODE: 'create_node'
};

export const TaskStatus = {
  PENDING: 'pending',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const ConnectionTypes = {
  RELATES_TO: 'relates_to',
  SUPPORTS: 'supports',
  CONTRADICTS: 'contradicts',
  DEPENDS_ON: 'depends_on'
};

export const createMindMapNode = (id, label, type, position, content = '') => ({
  id,
  label,
  type,
  position,
  content,
  relationships: [],
  metadata: {
    timestamp: new Date().toISOString(),
    confidence: 1.0,
    tags: []
  }
});

export const createAgentTask = (type, description) => ({
  id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  description,
  status: TaskStatus.PENDING,
  timestamp: new Date().toISOString()
});

export const createConnection = (from, to, type, strength = 1.0) => ({
  id: `conn_${from}_${to}`,
  from,
  to,
  type,
  strength
});