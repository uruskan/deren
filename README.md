# DEREN - Dynamic Exploration & Reasoning Entity

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.4.2-646cff)

**The Gatherer of Thought** - An AI-powered research agent with visual mind mapping capabilities.

![DEREN Screenshot](./screenshot.png)

## Overview

DEREN is an innovative AI research assistant that combines autonomous reasoning with interactive visual mind mapping. It's designed to help users conduct deep research, explore complex topics, and synthesize information through an intuitive visual interface.

### Key Features

- **AI Research Agent**: Autonomous agent that can plan, execute, and synthesize research tasks
- **Visual Mind Mapping**: Interactive canvas for creating and organizing knowledge graphs
- **Real-time Collaboration**: Seamless integration between human intuition and AI analysis
- **Multiple Node Types**: Support for concepts, findings, sources, and custom canvas pages
- **ChatGPT Integration Ready**: Built to work with ChatGPT's "work with" feature
- **Project Management**: Save and load research sessions as JSON files

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/uruskan/deren.git
cd deren
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Command Terminal

The command terminal on the right side accepts natural language commands:

- **Research Commands**: `"research artificial intelligence"`, `"analyze climate change"`
- **Canvas Commands**: `"create canvas page"`, `"new page"`
- **Custom Queries**: Enter any research topic or question

### Mind Map Canvas

- **Create Nodes**: Double-click on empty space to create a new node
- **Edit Nodes**: Click on a node to select it, then edit its content
- **Create Connections**: Drag from one node to another to create a connection
- **Delete Elements**: Select and press Delete key
- **Pan & Zoom**: Use mouse wheel to zoom, drag to pan

### Quick Actions

Use the quick action buttons in the sidebar for common tasks:
- **Demo: AI Research** - Example AI research workflow
- **Demo: Climate Analysis** - Example climate change analysis
- **Create Canvas Page** - Add a new canvas page node

### Project Management

- **Save Project**: Click the save icon to download your research as a JSON file
- **Load Project**: Click the load icon to import a previously saved project
- **Clear Canvas**: Click the X icon to clear all nodes and connections

## Architecture

### Technology Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Animation**: Framer Motion 10.16.16
- **Flow Visualization**: ReactFlow 11.10.1
- **Canvas Drawing**: Tldraw 2.0.0
- **Icons**: Lucide React

### Project Structure

```
deren/
├── src/
│   ├── components/
│   │   ├── Canvas/         # Mind map canvas components
│   │   └── Terminal/       # Command terminal component
│   ├── services/
│   │   └── AgentService.js # AI agent logic
│   ├── utils/
│   │   └── types.js        # Type definitions and utilities
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Application entry point
├── package.json
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- Real API integration for live web research
- Advanced AI reasoning with LLM integration
- Collaborative multi-user sessions
- Export to various formats (PDF, Markdown, etc.)
- Plugin system for custom tools
- Voice command support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies
- Inspired by the need for better research tools
- Designed for seamless human-AI collaboration
