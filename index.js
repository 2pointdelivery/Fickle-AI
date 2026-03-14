import dotenv from 'dotenv';
dotenv.config();

import { initDb } from './db.js';
import { MCPManager } from './mcp-manager.js';
import { QueueManager } from './queue-manager.js';
import { Orchestrator } from './orchestrator.js';
import { createWorker } from './worker.js';

async function main() {
    console.log('🚀  Fickle AI — Lightweight Business Autopilot Starting...');
    console.log(`   Model : ${process.env.OLLAMA_MODEL || 'llama3'}`);
    console.log(`   Ollama: ${process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'}`);

    // 1. Initialize Database
    await initDb();

    // 2. MCP Tool Management
    const mcp = new MCPManager();
    // ──────────────────────────────────────────────────────────────────────────
    // To connect MCP servers, uncomment one or more of the lines below.
    // Each server exposes tools the CEO can use to operate the business.
    // ──────────────────────────────────────────────────────────────────────────
    // await mcp.connectServer('filesystem', 'npx', ['-y', '@modelcontextprotocol/server-filesystem', './data']);
    // await mcp.connectServer('github',     'npx', ['-y', '@modelcontextprotocol/server-github']);
    // await mcp.connectServer('brave',      'npx', ['-y', '@modelcontextprotocol/server-brave-search']);
    // ──────────────────────────────────────────────────────────────────────────

    // 3. Queue Manager
    const queue = new QueueManager();

    // 4. AI Orchestrator (CEO Agent)
    const orchestrator = new Orchestrator(mcp, queue);

    // 5. Register Specialized Workers
    queue.registerWorker('dev',       createWorker('dev',       orchestrator));
    queue.registerWorker('marketing', createWorker('marketing', orchestrator));
    queue.registerWorker('support',   createWorker('support',   orchestrator));
    console.log('✅  Workers registered: dev, marketing, support');

    // 6. Start Queue Polling
    const pollInterval = parseInt(process.env.QUEUE_POLL_INTERVAL || '5000');
    queue.startPolling(pollInterval);

    // 7. Run first CEO Loop immediately
    await orchestrator.runCeoLoop();

    // 8. Schedule recurring CEO Loop
    const ceoInterval = parseInt(process.env.CEO_LOOP_INTERVAL || `${1000 * 60 * 60 * 24}`);
    setInterval(() => orchestrator.runCeoLoop(), ceoInterval);
    console.log(`⏰  CEO Loop scheduled every ${Math.round(ceoInterval / 1000 / 60)} minute(s).`);
    console.log('\nAutopilot is active. Run `node monitor.js` in another terminal to watch activity.');
}

main().catch(err => {
    console.error('\n💥 CRITICAL ERROR:', err.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Is Ollama installed? → https://ollama.com');
    console.error('  2. Is Ollama running?   → ollama serve');
    console.error(`  3. Is the model pulled? → ollama pull ${process.env.OLLAMA_MODEL || 'llama3'}`);
    process.exit(1);
});
