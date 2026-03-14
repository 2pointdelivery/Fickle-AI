import { Ollama } from 'ollama';
import { dbGet, dbRun, dbAll } from './db.js';

export class Orchestrator {
    constructor(mcpManager, queueManager) {
        this.mcp = mcpManager;
        this.queue = queueManager;
        this.model = process.env.OLLAMA_MODEL || 'gemma3:latest';
        this.host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        this.apiKey = process.env.OLLAMA_API_KEY || '';
        this.localHost = 'http://127.0.0.1:11434'; // Fixed local fallback
        
        this.client = new Ollama({ host: this.host });
        this.localClient = new Ollama({ host: this.localHost });
        
        this.loopStatus = {
            ceo: 'idle', marketing: 'idle', support: 'idle', 
            outreach: 'idle', operations: 'idle', fundraising: 'idle'
        };
        this.timers = {};
        this.intervals = JSON.parse(process.env.LOOP_INTERVALS || "{}");
    }

    async logEvent(message, level = 'info', source = 'system') {
        console.log(`[${source.toUpperCase()}] ${message}`);
        await dbRun(
            "INSERT INTO logs (level, message, source) VALUES (?, ?, ?)",
            [level, message, source]
        );
    }

    startIntervals() {
        // Clear existing
        Object.values(this.timers).forEach(t => clearInterval(t));
        this.timers = {};

        const loops = [
            { name: 'ceo', method: 'runCeoLoop' },
            { name: 'marketing', method: 'runMarketingLoop' },
            { name: 'support', method: 'runSupportLoop' },
            { name: 'outreach', method: 'runOutreachLoop' },
            { name: 'operations', method: 'runOperationsLoop' },
            { name: 'fundraising', method: 'runFundraisingLoop' }
        ];

        loops.forEach(l => {
            const ms = parseInt(this.intervals[l.name]) || 0;
            if (ms > 0) {
                // Staggered starts to prevent all loops hitting AI at once
                const stagger = Math.random() * 5000; 
                setTimeout(() => {
                    console.log(`Scheduling ${l.name} loop every ${ms}ms`);
                    this.timers[l.name] = setInterval(() => {
                        if (this.loopStatus[l.name] === 'idle') {
                            this[l.method]().catch(err => {
                                console.error(`[${l.name}] Loop Error:`, err.message);
                                this.loopStatus[l.name] = 'idle';
                            });
                        }
                    }, ms);
                    // Immediate first run if idle
                    if (this.loopStatus[l.name] === 'idle') this[l.method]().catch(console.error);
                }, stagger);
            }
        });
    }

    async getPrompt(loopName, defaultPrompt) {
        try {
            const row = await dbGet("SELECT value FROM memory WHERE key = ?", [`prompt_${loopName}`]);
            return row ? row.value : defaultPrompt;
        } catch (e) { return defaultPrompt; }
    }

    async checkOllamaHealth() {
        const results = {
            local: { ok: false, models: [], error: null },
            cloud: { ok: false, models: [], isProxy: false, error: null }
        };

        // Normalize host for local check
        let localUrl = this.host;
        if (!localUrl.startsWith('http')) localUrl = `http://${localUrl}`;

        // Check Local
        try {
            const res = await fetch(`${localUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                const data = await res.json();
                results.local = { ok: true, models: (data.models || []).map(m => m.name) };
            } else {
                results.local.error = `HTTP ${res.status}`;
            }
        } catch (e) {
            results.local.error = e.message;
        }

        // Check Cloud
        if (this.apiKey) {
            let activeHost = this.cloudHost || 'https://openrouter.ai/api';
            
            // Auto-detect based on key if host is local or default
            if (this.host.includes('127.0.0.1') || this.host.includes('localhost') || !this.cloudHost) {
                if (this.apiKey.startsWith('gsk_')) activeHost = 'https://api.groq.com/openai';
                else if (this.apiKey.includes('.CLU')) activeHost = 'https://openrouter.ai/api';
                else if (this.apiKey.startsWith('sk-')) activeHost = 'https://api.openai.com';
            }

            try {
                // Determine if we should use v1/models (OpenAI) or api/tags (Ollama)
                const isCloudProxy = activeHost.includes('openrouter') || activeHost.includes('groq') || activeHost.includes('openai');
                const checkUrl = isCloudProxy ? `${activeHost}/v1/models` : `${activeHost}/api/tags`;
                
                const res = await fetch(checkUrl, {
                    headers: { 'Authorization': `Bearer ${this.apiKey}` },
                    signal: AbortSignal.timeout(5000)
                });

                if (res.ok) {
                    const data = await res.json();
                    const models = isCloudProxy ? (data.data || []).map(m => m.id) : (data.models || []).map(m => m.name);
                    results.cloud = { ok: true, models, isProxy: isCloudProxy };
                } else {
                    results.cloud.error = `HTTP ${res.status} at ${checkUrl}`;
                }
            } catch (e) {
                results.cloud.error = e.message;
            }
        }

        return results;
    }
    async think(prompt, systemPrompt = null, context = []) {
        const tools = this.mcp.getTools();
        const toolsSummary = tools.length > 0
            ? `Available MCP tools:\n${tools.map(t => `- ${t.name} (${t.serverName}): ${t.description}`).join('\n')}`
            : 'No MCP tools connected.';

        // Increased memory context window to 20 items for better learning
        const memoryRows = await dbAll("SELECT key, value FROM memory ORDER BY updated_at DESC LIMIT 20");
        const memoryContext = memoryRows.length > 0 
            ? `\nStored Intelligence (Memory & Facts):\n${memoryRows.map(m => `- ${m.key}: ${m.value}`).join('\n')}`
            : '';

        await this.logEvent(`Initializing reasoning engine with ${tools.length} tools and ${memoryRows.length} memory nodes.`, 'info', 'ai');

        const jsonInstruction = `\nRespond in JSON format:
{ 
  "reply": "Your friendly natural language response here",
  "tasks": [{ "type": "dev|marketing|support|outreach|ops|fundraising", "description": "..." }],
  "memory": [{ "key": "...", "value": "..." }],
  "calls": [{ "server": "...", "tool": "...", "arguments": { ... } }]
}
IMPORTANT: Always include a "reply" field with your response. Only use tools that are listed as available. Use memory efficiently.`;

        const baseSysPrompt = systemPrompt || "You are Fickle AI CEO — an autonomous business operator.";
        const fullSysPrompt = `${baseSysPrompt}\n${toolsSummary}${memoryContext}${jsonInstruction}\nThink step-by-step.`.trim();

        // 🟢 ATTEMPT 1: Cloud AI (if configured)
        if (this.apiKey) {
            await this.logEvent(`Querying cloud intelligence (${this.model})...`, 'info', 'ai');
            try {
                const res = await fetch(`${this.host}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [{ role: 'system', content: fullSysPrompt }, ...context, { role: 'user', content: prompt }],
                        stream: false, format: 'json'
                    })
                });
                if (res.ok) {
                    await this.logEvent('Cloud intelligence response received.', 'success', 'ai');
                    const data = await res.json();
                    return data.message?.content || data.choices?.[0]?.message?.content || JSON.stringify(data);
                }
                throw new Error(`Cloud AI returned ${res.status}`);
            } catch (e) {
                console.warn('⚠️ Cloud AI failed. Falling back to Local Ollama:', e.message);
                // Fallback handled below
            }
        }

        // 🟢 ATTEMPT 2: Local AI Fallback
        await this.logEvent(`Executing via local Ollama engine (gemma3:latest)...`, 'info', 'ai');
        try {
            const response = await this.localClient.chat({
                model: 'gemma3:latest', // Use a standard local model for fallback
                messages: [{ role: 'system', content: fullSysPrompt }, ...context, { role: 'user', content: prompt }],
                format: 'json'
            });
            await this.logEvent('Local intelligence cycle complete.', 'success', 'ai');
            return response.message.content;
        } catch (e) {
            console.error('❌ Critical AI Failure (Cloud & Local):', e.message);
            throw e;
        }
    }

    async runCeoLoop() {
        this.logEvent('CEO Planning Loop initiated', 'info', 'ceo');
        this.loopStatus.ceo = 'thinking';
        const health = await this.checkOllamaHealth();
        if (!health.local.ok && !health.cloud.ok) { 
            this.logEvent('AI Engines Offline', 'error', 'ceo');
            this.loopStatus.ceo = 'idle'; return; 
        }

        const statusRow = await dbGet("SELECT value FROM memory WHERE key = 'company_status'");
        const currentStatus = statusRow?.value ?? 'Bootstrap mode.';
        const defaultPrompt = `Status: ${currentStatus}\nPlan top priorities in JSON.`;
        const planPrompt = await this.getPrompt('ceo', defaultPrompt);
        
        this.logEvent('CEO is analyzing strategy...', 'info', 'ceo');
        const response = await this.think(planPrompt);
        this.logEvent('CEO reasoning complete. Processing plan...', 'info', 'ceo');
        this.loopStatus.ceo = 'queuing';
        await this.queueTasksFromResponse(response, 'ceo');
        
        this.loopStatus.ceo = 'storing';
        await dbRun(
            `INSERT INTO memory (key, value) VALUES ('company_status', ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
            [`Last hybrid plan: ${new Date().toLocaleString()}`]
        );
        this.logEvent('CEO cycle completed', 'info', 'ceo');
        this.loopStatus.ceo = 'idle';
    }

    async runMarketingLoop() {
        this.logEvent('Marketing Loop started', 'info', 'marketing');
        this.loopStatus.marketing = 'thinking';
        const brand = (await dbGet("SELECT value FROM memory WHERE key = 'brand_info'"))?.value || 'Fickle Services';
        const defaultPrompt = `Plan marketing for: ${brand}. Respond JSON.`;
        const prompt = await this.getPrompt('marketing', defaultPrompt);
        const response = await this.think(prompt, 'You are Fickle AI Marketing Director.');
        this.loopStatus.marketing = 'queuing';
        await this.queueTasksFromResponse(response, 'marketing');
        this.logEvent('Marketing tasks queued', 'info', 'marketing');
        this.loopStatus.marketing = 'idle';
    }

    async runSupportLoop() {
        this.logEvent('Support Loop started', 'info', 'support');
        this.loopStatus.support = 'thinking';
        const faq = (await dbGet("SELECT value FROM memory WHERE key = 'support_faq'"))?.value || 'No FAQ.';
        const defaultPrompt = `Manage support for: ${faq}. Respond JSON.`;
        const prompt = await this.getPrompt('support', defaultPrompt);
        const response = await this.think(prompt, 'You are Fickle AI Support Director.');
        this.loopStatus.support = 'queuing';
        await this.queueTasksFromResponse(response, 'support');
        this.logEvent('Support tickets processed', 'info', 'support');
        this.loopStatus.support = 'idle';
    }

    async runOutreachLoop() {
        this.logEvent('Outreach Loop started', 'info', 'outreach');
        this.loopStatus.outreach = 'thinking';
        const icp = (await dbGet("SELECT value FROM memory WHERE key = 'ideal_customer_profile'"))?.value || 'Leads.';
        const defaultPrompt = `Plan outreach for: ${icp}. Respond JSON.`;
        const prompt = await this.getPrompt('outreach', defaultPrompt);
        const response = await this.think(prompt, 'You are Fickle AI Growth Director.');
        this.loopStatus.outreach = 'queuing';
        await this.queueTasksFromResponse(response, 'outreach');
        this.logEvent('Outreach strategy defined', 'info', 'outreach');
        this.loopStatus.outreach = 'idle';
    }

    async runOperationsLoop() {
        this.logEvent('Operations Loop started', 'info', 'operations');
        this.loopStatus.operations = 'thinking';
        const ctx = (await dbGet("SELECT value FROM memory WHERE key = 'operations_context'"))?.value || 'Operations.';
        const defaultPrompt = `Manage operations for: ${ctx}. Respond JSON.`;
        const prompt = await this.getPrompt('operations', defaultPrompt);
        const response = await this.think(prompt, 'You are Fickle AI Operations Director.');
        this.loopStatus.operations = 'queuing';
        await this.queueTasksFromResponse(response, 'operations');
        this.logEvent('Operations plan updated', 'info', 'operations');
        this.loopStatus.operations = 'idle';
    }

    async runFundraisingLoop() {
        this.logEvent('Fundraising Loop started', 'info', 'fundraising');
        this.loopStatus.fundraising = 'thinking';
        const metrics = (await dbGet("SELECT value FROM memory WHERE key = 'traction_metrics'"))?.value || 'Early stage.';
        const defaultPrompt = `Manage fundraising for: ${metrics}. Respond JSON.`;
        const prompt = await this.getPrompt('fundraising', defaultPrompt);
        const response = await this.think(prompt, 'You are Fickle AI Fundraising Director.');
        this.loopStatus.fundraising = 'queuing';
        await this.queueTasksFromResponse(response, 'fundraising');
        this.logEvent('Fundraising tasks queued', 'info', 'fundraising');
        this.loopStatus.fundraising = 'idle';
    }

    async queueTasksFromResponse(response, loopName) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const plan = JSON.parse(jsonMatch[0]);
                
                // 1. Handle Memory Updates Autonomousely
                if (plan.memory && Array.isArray(plan.memory)) {
                    for (const m of plan.memory) {
                        if (m.key && m.value) {
                            await this.logEvent(`Persisted new knowledge: ${m.key}`, 'success', 'learning');
                            await dbRun(
                                "INSERT INTO memory (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
                                [m.key, m.value]
                            );
                        }
                    }
                }

                // 2. Queue Tasks
                for (const task of (plan.tasks || [])) {
                    await this.logEvent(`Queuing new task: ${task.description.substring(0, 50)}...`, 'info', loopName);
                    await this.queue.addJob(task.type || loopName, { 
                        description: task.description, loop: loopName, triggeredAt: new Date().toISOString() 
                    });
                }

                // 3. Execute Tool Calls immediately for Live Activities
                if (plan.calls && Array.isArray(plan.calls)) {
                    for (const call of plan.calls) {
                        await this.executeToolCall(call, loopName);
                    }
                }
            }
        } catch (e) { console.error(`❌ Loop ${loopName} failure:`, e.message); }
    }

    async executeToolCall(call, source) {
        this.logEvent(`Calling tool: ${call.server}.${call.tool}`, 'info', source);
        try {
            const result = await this.mcp.callTool(call.server, call.tool, call.arguments);
            const summary = JSON.stringify(result).substring(0, 500);
            this.logEvent(`Tool Success: ${call.tool} -> ${summary}...`, 'success', source);
            
            // Auto-store significant results in memory for next loop
            const memKey = `recent_tool_output_${call.tool}`;
            await dbRun(
                "INSERT INTO memory (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
                [memKey, JSON.stringify({ result, timestamp: new Date().toISOString() })]
            );
        } catch (e) {
            this.logEvent(`Tool Failed: ${call.tool} - ${e.message}`, 'error', source);
        }
    }
}
