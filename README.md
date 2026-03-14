# 🤖 Fickle AI — Business Autopilot v4.5

Fickle AI is an autonomous business operator that runs your operations on autopilot using:
- **Ollama** — local AI reasoning (no cloud required) or Hybrid AI (Groq, OpenRouter, OpenAI)
- **MCP Servers** — pluggable tool ecosystem for live production activities
- **Autonomous Memory** — system-wide persistence and AI self-learning
- **Real-Time Monitoring** — live system console and granular status tracking

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Fickle AI                            │
│                                                             │
│   ┌──────────────────┐       ┌──────────────────────────┐  │
│   │  CEO Orchestrator│──────▶│      SQLite Queue         │  │
│   │  (Ollama/Cloud)  │       │  pending/processing/done  │  │
│   └────────┬─────────┘       └──────────────────────────┘  │
│            │                       ▲   ▲   ▲               │
│            ▼                       │   │   │               │
│   ┌──────────────────┐     ┌───────┘ ┌─┘ ┌┘              │
│   │   MCP Manager    │     │ Worker  │Dev│ │Support        │
│   │ (Live Tool Calls)│     │Marketing│   │                 │
│   └──────────────────┘     └─────────┴───┴────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- **Live System Console**: Watch the AI's "brain" in real-time as it plans and calls tools.
- **Granular Status**: See exact cognitive phases: `THINKING`, `QUEUING`, `STORING MEMORY`.
- **Hybrid AI**: Seamless fallback between local Ollama and cloud providers like Groq or OpenRouter.
- **MCP Integration Hub**: Connect 40+ integrations (Brave, Google, GitHub, etc.) directly from the dashboard.

## Setup

### 1. Install Ollama
Download and install from https://ollama.com, then:
```sh
ollama serve
```

### 2. Clone & Install
```sh
cd c:/laragon/www/tasker
npm install
```

### 3. Configure
Copy `.env.example` to `.env` and adjust values:
```sh
copy .env.example .env
```

### 4. Run to Start UI
```sh
npm start
```
Go to `http://localhost:3000` to start the Autopilot.

---

## File Structure

```
tasker/
├── server.js         # API Server & Dashboard host
├── orchestrator.js   # AI Heart — handles loops and tool execution
├── worker.js         # Specialized workers (dev, marketing, support)
├── queue-manager.js  # SQLite-based task queue
├── mcp-manager.js    # MCP server connection & tool interface
├── mcp-registry.js   # Integration definitions (40+ tools)
├── db.js             # SQLite database & event logging
├── .env              # Your configuration
└── public/           # Premium Dashboard UI
```
