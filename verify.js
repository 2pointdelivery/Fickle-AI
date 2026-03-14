import { Orchestrator } from './orchestrator.js';
import { QueueManager } from './queue-manager.js';
import { MCPManager } from './mcp-manager.js';
import { initDb } from './db.js';

async function verify() {
    console.log('Running Verification Test...');
    await initDb();
    
    const mcp = new MCPManager();
    const queue = new QueueManager();
    const orchestrator = new Orchestrator(mcp, queue);

    console.log('Testing AI Orchestrator thinking...');
    try {
        const response = await orchestrator.think('Explain your purpose in one sentence.');
        console.log('AI Response:', response);
        console.log('Reasoning Verified ✅');
    } catch (e) {
        console.error('AI Reasoning Failed ❌', e.message);
    }

    console.log('Testing Task Creation...');
    await queue.addJob('dev', { description: 'Create a README file' });
    const job = await queue.getNextJob();
    if (job && job.type === 'dev') {
        console.log('Queueing Verified ✅');
    } else {
        console.error('Queueing Failed ❌');
    }

    console.log('Verification Complete.');
    process.exit(0);
}

verify();
