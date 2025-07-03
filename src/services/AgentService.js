import { v4 as uuidv4 } from 'uuid';
import { createAgentTask, createMindMapNode, createConnection, TaskStatus, TaskTypes, NodeTypes } from '../utils/types.js';

export class AgentService {
  constructor() {
    this.isActive = false;
    this.currentMission = null;
    this.taskQueue = [];
    this.memory = {
      workingMemory: {
        currentMission: '',
        recentTasks: [],
        contextSummary: ''
      },
      longTermMemory: {
        savedMaps: [],
        knowledgeBase: []
      }
    };
    this.tools = this.initializeTools();
  }

  initializeTools() {
    return {
      search_web: this.searchWeb.bind(this),
      fetch_url: this.fetchUrl.bind(this),
      summarize: this.summarize.bind(this),
      extract_data: this.extractData.bind(this),
      store_node: this.storeNode.bind(this),
      ask_followup: this.askFollowup.bind(this),
      embed: this.embed.bind(this),
      read_file: this.readFile.bind(this)
    };
  }

  async executeMission(mission, onProgress) {
    this.isActive = true;
    this.currentMission = mission;
    this.memory.workingMemory.currentMission = mission;
    
    try {
      // Phase 1: Planning
      await this.updateProgress(onProgress, 'Planning research strategy...', 10);
      const plan = await this.generatePlan(mission);
      
      // Phase 2: Execution
      await this.updateProgress(onProgress, 'Executing research plan...', 25);
      const results = await this.executePlan(plan, onProgress);
      
      // Phase 3: Synthesis
      await this.updateProgress(onProgress, 'Synthesizing findings...', 80);
      const synthesized = await this.synthesizeResults(results);
      
      // Phase 4: Mind Map Creation
      await this.updateProgress(onProgress, 'Creating mind map...', 95);
      const mindMap = await this.createMindMap(synthesized);
      
      await this.updateProgress(onProgress, 'Mission completed', 100);
      
      this.isActive = false;
      return mindMap;
      
    } catch (error) {
      console.error('Mission execution failed:', error);
      this.isActive = false;
      throw error;
    }
  }

  async updateProgress(onProgress, message, progress) {
    if (onProgress) {
      onProgress({ message, progress });
    }
    await this.delay(500); // Simulate processing time
  }

  async generatePlan(mission) {
    // Simulate AI planning process
    const task = createAgentTask(TaskTypes.ANALYZE, `Generate research plan for: ${mission}`);
    this.addTask(task);
    
    await this.delay(1000);
    this.completeTask(task.id, {
      steps: [
        'Search for primary sources',
        'Identify key concepts',
        'Find expert opinions',
        'Analyze contradictions',
        'Synthesize findings'
      ]
    });

    return task.result;
  }

  async executePlan(plan, onProgress) {
    const results = [];
    
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      const progress = 25 + (i / plan.steps.length) * 50;
      
      await this.updateProgress(onProgress, `Executing: ${step}`, progress);
      
      // Simulate executing each step
      const task = createAgentTask(TaskTypes.SEARCH, step);
      this.addTask(task);
      
      await this.delay(1500);
      
      // Generate mock results
      const result = this.generateMockResult(step);
      this.completeTask(task.id, result);
      results.push(result);
    }
    
    return results;
  }

  generateMockResult(step) {
    const mockResults = {
      'Search for primary sources': {
        sources: [
          { title: 'Academic Research Paper', url: 'https://example.com/paper1', confidence: 0.9 },
          { title: 'Industry Report', url: 'https://example.com/report1', confidence: 0.8 },
          { title: 'Expert Interview', url: 'https://example.com/interview1', confidence: 0.7 }
        ]
      },
      'Identify key concepts': {
        concepts: [
          { name: 'Core Concept A', relevance: 0.9, definition: 'A fundamental principle in this domain' },
          { name: 'Key Factor B', relevance: 0.8, definition: 'An important influencing factor' },
          { name: 'Related Theory C', relevance: 0.7, definition: 'A supporting theoretical framework' }
        ]
      },
      'Find expert opinions': {
        opinions: [
          { expert: 'Dr. Jane Smith', opinion: 'This approach shows promise but requires careful consideration', confidence: 0.9 },
          { expert: 'Prof. John Doe', opinion: 'The evidence suggests a more nuanced view is needed', confidence: 0.8 }
        ]
      },
      'Analyze contradictions': {
        contradictions: [
          { topic: 'Implementation Approach', viewpoint1: 'Rapid deployment is essential', viewpoint2: 'Gradual implementation reduces risk' },
          { topic: 'Cost-Benefit Analysis', viewpoint1: 'Short-term costs are justified', viewpoint2: 'Long-term sustainability is more important' }
        ]
      },
      'Synthesize findings': {
        synthesis: 'The research reveals a complex landscape with multiple valid perspectives. Key considerations include implementation timeline, cost factors, and stakeholder engagement.'
      }
    };

    return mockResults[step] || { data: `Results for ${step}`, confidence: 0.8 };
  }

  async synthesizeResults(results) {
    const task = createAgentTask(TaskTypes.ANALYZE, 'Synthesizing all research findings');
    this.addTask(task);
    
    await this.delay(1000);
    
    const synthesis = {
      summary: 'Comprehensive analysis completed with multiple perspectives identified',
      keyFindings: results.map((r, i) => `Finding ${i + 1}: ${Object.keys(r)[0]}`),
      confidence: 0.85,
      recommendations: [
        'Further investigation recommended for contradictory viewpoints',
        'Stakeholder consultation advised before implementation',
        'Pilot program could validate key assumptions'
      ]
    };
    
    this.completeTask(task.id, synthesis);
    return synthesis;
  }

  async createMindMap(synthesis) {
    const nodes = [];
    const connections = [];
    
    // Create root node at center
    const rootNode = createMindMapNode(
      `ai-gen-root-${uuidv4()}`,
      this.currentMission,
      NodeTypes.ROOT,
      { x: 0, y: 0 }, // Center position
      synthesis.summary
    );
    nodes.push(rootNode);
    
    // Create concept nodes in a circular pattern around the root
    const conceptRadius = 350;
    const conceptCount = synthesis.keyFindings.length;
    
    synthesis.keyFindings.forEach((finding, index) => {
      const angle = (index / conceptCount) * 2 * Math.PI;
      const x = Math.cos(angle) * conceptRadius;
      const y = Math.sin(angle) * conceptRadius;
      
      const node = createMindMapNode(
        `ai-gen-concept-${uuidv4()}`,
        finding.replace('Finding ', 'Research Area '),
        NodeTypes.CONCEPT,
        { x, y },
        `Detailed analysis of ${finding}`
      );
      nodes.push(node);
      
      // Connect to root
      const connection = createConnection(
        rootNode.id,
        node.id,
        'relates_to',
        0.8
      );
      connections.push(connection);
    });
    
    // Create finding nodes in an outer ring
    const findingRadius = 550;
    const findingCount = synthesis.recommendations.length;
    
    synthesis.recommendations.forEach((rec, index) => {
      const angle = (index / findingCount) * 2 * Math.PI + (Math.PI / findingCount); // Offset from concepts
      const x = Math.cos(angle) * findingRadius;
      const y = Math.sin(angle) * findingRadius;
      
      const node = createMindMapNode(
        `ai-gen-finding-${uuidv4()}`,
        `Key Insight ${index + 1}`,
        NodeTypes.FINDING,
        { x, y },
        rec
      );
      nodes.push(node);
      
      // Connect to root
      const connection = createConnection(
        rootNode.id,
        node.id,
        'supports',
        0.9
      );
      connections.push(connection);
      
      // Connect to nearest concept node
      if (synthesis.keyFindings.length > index) {
        const conceptNode = nodes[index + 1]; // +1 because root is at index 0
        if (conceptNode) {
          const conceptConnection = createConnection(
            conceptNode.id,
            node.id,
            'supports',
            0.7
          );
          connections.push(conceptConnection);
        }
      }
    });

    // Add some source nodes for variety
    const sourceRadius = 250;
    const sourcePositions = [
      { angle: Math.PI / 4, label: 'Primary Sources' },
      { angle: 3 * Math.PI / 4, label: 'Expert Opinions' },
      { angle: 5 * Math.PI / 4, label: 'Research Data' },
      { angle: 7 * Math.PI / 4, label: 'Case Studies' }
    ];

    sourcePositions.forEach((source, index) => {
      const x = Math.cos(source.angle) * sourceRadius;
      const y = Math.sin(source.angle) * sourceRadius;
      
      const node = createMindMapNode(
        `ai-gen-source-${uuidv4()}`,
        source.label,
        NodeTypes.SOURCE,
        { x, y },
        `Supporting documentation and references for ${source.label.toLowerCase()}`
      );
      nodes.push(node);
      
      // Connect to root
      const connection = createConnection(
        rootNode.id,
        node.id,
        'depends_on',
        0.6
      );
      connections.push(connection);
    });
    
    return { nodes, connections };
  }

  // Tool implementations (mocked for demo)
  async searchWeb(query) {
    await this.delay(800);
    return {
      success: true,
      data: [
        { title: `Search result for ${query}`, url: 'https://example.com', snippet: 'Relevant information found...' }
      ]
    };
  }

  async fetchUrl(url) {
    await this.delay(600);
    return {
      success: true,
      data: { content: `Content from ${url}`, metadata: { title: 'Example Page' } }
    };
  }

  async summarize(text) {
    await this.delay(500);
    return {
      success: true,
      data: { summary: `Summary of: ${text.substring(0, 50)}...`, keyPoints: ['Point 1', 'Point 2'] }
    };
  }

  async extractData(text) {
    await this.delay(400);
    return {
      success: true,
      data: { entities: ['Entity 1', 'Entity 2'], facts: ['Fact 1', 'Fact 2'] }
    };
  }

  async storeNode(nodeData) {
    await this.delay(300);
    return {
      success: true,
      data: { nodeId: uuidv4(), stored: true }
    };
  }

  async askFollowup(question) {
    await this.delay(1000);
    return {
      success: true,
      data: { answer: `Analysis of: ${question}`, confidence: 0.8 }
    };
  }

  async embed(text) {
    await this.delay(200);
    return {
      success: true,
      data: { vector: new Array(384).fill(0).map(() => Math.random()), stored: true }
    };
  }

  async readFile(filepath) {
    await this.delay(300);
    return {
      success: true,
      data: { content: `File content from ${filepath}`, type: 'text' }
    };
  }

  addTask(task) {
    task.status = TaskStatus.EXECUTING;
    this.taskQueue.push(task);
    this.memory.workingMemory.recentTasks.push(task);
  }

  completeTask(taskId, result) {
    const task = this.taskQueue.find(t => t.id === taskId);
    if (task) {
      task.status = TaskStatus.COMPLETED;
      task.result = result;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isActive: this.isActive,
      currentMission: this.currentMission,
      taskQueue: this.taskQueue,
      memory: this.memory
    };
  }
}