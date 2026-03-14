import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { initDb } from './db.js';
import { CredentialStore } from './credential-store.js';
import { MCP_REGISTRY, getServerById, getCategories } from './mcp-registry.js';
import { MCPManager } from './mcp-manager.js';
import { QueueManager } from './queue-manager.js';
import { Orchestrator } from './orchestrator.js';
import { createWorker } from './worker.js';
import { dbAll, dbRun, dbGet } from './db.js';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const credStore = new CredentialStore();
let mcp, queue, orchestrator;
let systemRunning = false;

const RECOMMENDED_MODELS = [
    'llama3.2:1b', 
    'llama3.2:3b',
    'gemma2:2b', 
    'qwen2.5:1.5b', 
    'mistral:latest', 
    'deepseek-r1:1.5b', 
    'phi3:latest'
];

// ─── STATUS ───────────────────────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
    let tasks = [];
    let memory = [];
    let logs = [];
    try {
        tasks = await dbAll("SELECT * FROM tasks ORDER BY created_at DESC LIMIT 20");
        memory = await dbAll("SELECT * FROM memory");
        logs = await dbAll("SELECT * FROM logs ORDER BY created_at DESC LIMIT 15");
    } catch(e) {}

    const health = orchestrator ? await orchestrator.checkOllamaHealth() : { local: { ok: false, models: [] }, cloud: { ok: false, models: [] } };
    const availableModels = [...new Set([...health.local.models, ...health.cloud.models, ...RECOMMENDED_MODELS])].slice(0, 15);
    
    // Get latest significant thought from memory
    const thoughtRow = await dbGet("SELECT value FROM memory WHERE key = 'company_status'");
    const systemThought = thoughtRow?.value || 'Standby.';
    
    res.json({
        running: systemRunning,
        aiHealth: health,
        model: orchestrator?.model || process.env.OLLAMA_MODEL,
        connectedServers: systemRunning ? (mcp?.listConnected() ?? []) : [],
        mcpStatus: mcp?.getStatusMap() || {},
        tasks,
        memory,
        logs,
        systemThought,
        availableModels,
        loopStatus: orchestrator?.loopStatus || {}
    });
});

app.get('/api/health/full', async (req, res) => {
    const health = {
        timestamp: new Date().toISOString(),
        api: { status: 'ok', uptime: process.uptime() },
        db: { status: 'unknown', error: null, memoryCount: 0 },
        ai: { status: 'unknown', local: null, cloud: null },
        mcp: { status: 'unknown', servers: [] },
        queues: { status: 'unknown', details: null },
        orchestrator: { status: 'unknown', loops: {} },
        system: { platform: process.platform, memory: process.memoryUsage() }
    };

    try {
        await dbGet("SELECT 1");
        health.db.status = 'ok';
        const rows = await dbGet("SELECT COUNT(*) as count FROM memory");
        health.db.memoryCount = rows.count;
    } catch (e) { health.db.status = 'error'; health.db.error = e.message; }

    if (orchestrator) {
        const ai = await orchestrator.checkOllamaHealth();
        health.ai.local = ai.local;
        health.ai.cloud = ai.cloud;
        health.ai.status = (ai.local.ok || ai.cloud.ok) ? 'ok' : 'error';
    }

    if (mcp) {
        health.mcp.servers = mcp.getStatusMap();
        const allOk = Object.values(health.mcp.servers).every(s => s.status === 'connected');
        health.mcp.status = allOk ? 'ok' : 'degraded';
    }

    if (queue) {
        health.queues.status = 'ok';
        health.queues.details = queue.getStatus();
    }

    if (orchestrator) {
        health.orchestrator.status = systemRunning ? 'active' : 'idle';
        health.orchestrator.loops = orchestrator.loopStatus;
    }

    res.json(health);
});

// ─── REGISTRY ────────────────────────────────────────────────────────────────
app.get('/api/registry', (req, res) => {
    res.json({ servers: MCP_REGISTRY, categories: getCategories() });
});

// ─── CREDENTIALS ─────────────────────────────────────────────────────────────
app.get('/api/credentials', async (req, res) => {
    const all = await credStore.getAll();
    const map = {};
    all.forEach(c => { map[c.id] = c; });
    res.json({ credentials: map });
});

app.post('/api/credentials/:serverId', async (req, res) => {
    const { serverId } = req.params;
    const server = getServerById(serverId);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    const envVars = {};
    (server.fields || []).forEach(f => {
        if (req.body[f.key]) envVars[f.key] = req.body[f.key];
    });
    await credStore.save(serverId, envVars, true);

    if (systemRunning && mcp) {
        try {
            // Re-fetch ALL enabled to ensure we have full context for subprocess
            const allEnabled = await credStore.getAllEnabled();
            const fullEnv = { ...process.env };
            allEnabled.forEach(c => Object.assign(fullEnv, c.envVars));
            
            await mcp.connectServer(server.id, server.command, server.args, fullEnv);
        } catch (e) { console.warn(`Live-connect failed for ${serverId}:`, e.message); }
    }
    res.json({ success: true, message: `${server.name} credentials saved & connected` });
});

app.delete('/api/credentials/:serverId', async (req, res) => {
    await credStore.delete(req.params.serverId);
    res.json({ success: true });
});

app.patch('/api/credentials/:serverId/toggle', async (req, res) => {
    await credStore.toggle(req.params.serverId, req.body.enabled);
    res.json({ success: true });
});

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
    const aiHealth = orchestrator ? await orchestrator.checkOllamaHealth() : null;
    
    const combinedModels = [...new Set([...(aiHealth?.local?.models || []), ...(aiHealth?.cloud?.models || []), ...RECOMMENDED_MODELS])].slice(0, 15);

    res.json({
        ollamaHost: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
        ollamaModel: process.env.OLLAMA_MODEL || 'gemma3:latest',
        ollamaApiKey: process.env.OLLAMA_API_KEY || '',
        queuePollInterval: parseInt(process.env.QUEUE_POLL_INTERVAL || '5000'),
        intervals: orchestrator ? orchestrator.intervals : (JSON.parse(process.env.LOOP_INTERVALS || "{}")),
        availableModels: combinedModels,
        aiHealth
    });
});

app.post('/api/settings', async (req, res) => {
    const { ollamaHost, ollamaModel, ollamaApiKey, intervals } = req.body;
    if (ollamaHost) process.env.OLLAMA_HOST = ollamaHost;
    if (ollamaModel) process.env.OLLAMA_MODEL = ollamaModel;
    if (ollamaApiKey !== undefined) process.env.OLLAMA_API_KEY = ollamaApiKey;
    if (intervals) process.env.LOOP_INTERVALS = JSON.stringify(intervals);

    // Gather all enabled credentials for the .env file
    const enabledCreds = await credStore.getAllEnabled();
    const envLines = [
        `OLLAMA_HOST=${process.env.OLLAMA_HOST}`,
        `OLLAMA_MODEL=${process.env.OLLAMA_MODEL}`,
        `OLLAMA_API_KEY=${process.env.OLLAMA_API_KEY || ''}`,
        `QUEUE_POLL_INTERVAL=${process.env.QUEUE_POLL_INTERVAL || '5000'}`,
        `LOOP_INTERVALS='${process.env.LOOP_INTERVALS || "{}"}'`,
        `PORT=${process.env.PORT || 3000}`,
    ];

    enabledCreds.forEach(c => {
        Object.entries(c.envVars).forEach(([key, val]) => {
            if (val) envLines.push(`${key}=${val}`);
        });
    });

    writeFileSync('.env', envLines.join('\n'));

    if (orchestrator) {
        orchestrator.model = process.env.OLLAMA_MODEL;
        orchestrator.host = process.env.OLLAMA_HOST;
        orchestrator.apiKey = process.env.OLLAMA_API_KEY;
        orchestrator.intervals = intervals || {};
        orchestrator.startIntervals();
        const { Ollama } = await import('ollama');
        orchestrator.client = new Ollama({ host: process.env.OLLAMA_HOST });
    }
    res.json({ success: true });
});

app.post('/api/models/pull', async (req, res) => {
    const { model } = req.body;
    if (!model) return res.status(400).json({ error: 'Model name required' });
    
    // Non-blocking pull
    import('child_process').then(({ exec }) => {
        exec(`ollama pull ${model}`, (err) => {
            if (err) console.error(`Pull failed: ${model}`, err);
            else console.log(`Model pulled: ${model}`);
        });
    });
    res.json({ success: true, message: `Started pulling ${model}` });
});

app.post('/api/chat/interactive', async (req, res) => {
    const { message } = req.body;
    if (!orchestrator) return res.status(400).json({ error: 'System not running' });

    try {
        const sysPrompt = "You are Fickle AI Interactive Assistant. Your primary goal is to help the user while LEARNING about their business. If the user shares a fact, preference, or goal, save it immediately to 'memory'. If they ask to add/modify tasks, do it. Always respond with a friendly reply in the 'reply' field. Your updates to memory will inform all autonomous loops (CEO, Marketing, etc.).";
        const response = await orchestrator.think(message, sysPrompt);
        
        let reply = "I've processed your request.";
        let modified = false;

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const plan = JSON.parse(jsonMatch[0]);
                await orchestrator.queueTasksFromResponse(response, 'interactive');
                modified = (plan.tasks?.length > 0 || plan.memory?.length > 0 || plan.calls?.length > 0);
                reply = plan.reply || response.replace(/\{[\s\S]*\}/, '').trim() || reply;
            } else {
                reply = response.trim() || reply;
            }
        } catch (e) {
            reply = response;
        }

        res.json({ reply, modified });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─── SYSTEM CONTROLS ──────────────────────────────────────────────────────────
app.post('/api/start', async (req, res) => {
    if (systemRunning) return res.json({ success: false, message: 'Already running' });
    try {
        mcp = new MCPManager();
        const enabled = await credStore.getAllEnabled();
        for (const cred of enabled) {
            const serverDef = getServerById(cred.id);
            if (serverDef) await mcp.connectServer(cred.id, serverDef.command, serverDef.args, { ...process.env, ...cred.envVars }).catch(e => console.warn(e.message));
        }
        queue = new QueueManager();
        orchestrator = new Orchestrator(mcp, queue);
        orchestrator.startIntervals(); // Start autonomous scheduling
        ['dev','marketing','support','outreach','ops','fundraising'].forEach(t => {
            queue.registerWorker(t, createWorker(t, orchestrator));
        });
        queue.startPolling(parseInt(process.env.QUEUE_POLL_INTERVAL || '5000'));
        orchestrator.runCeoLoop().catch(console.error);
        systemRunning = true;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/stop', (req, res) => { systemRunning = false; res.json({ success: true }); });

// ─── LOOP TRIGGERS ────────────────────────────────────────────────────────────
const requireRunning = (req, res, next) => {
    if (!systemRunning || !orchestrator) return res.status(400).json({ success: false, message: 'Start autopilot first' });
    next();
};

app.post('/api/loops/:loop', requireRunning, (req, res) => {
    const { loop } = req.params;
    const method = 'run' + loop.charAt(0).toUpperCase() + loop.slice(1) + 'Loop';
    if (orchestrator[method]) {
        orchestrator[method]().catch(console.error);
        res.json({ success: true });
    } else { res.status(404).json({ error: 'Loop not found' }); }
});

// ─── PROMPTS API ──────────────────────────────────────────────────────────────
app.get('/api/prompts/:loop', async (req, res) => {
    const row = await dbGet("SELECT value FROM memory WHERE key = ?", [`prompt_${req.params.loop}`]);
    res.json({ prompt: row?.value || '' });
});
app.post('/api/prompts/:loop', async (req, res) => {
    await dbRun("INSERT INTO memory (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP", [`prompt_${req.params.loop}`, req.body.prompt]);
    res.json({ success: true });
});

// ─── MEMORY ───────────────────────────────────────────────────────────────────
app.post('/api/memory', async (req, res) => {
    await dbRun("INSERT INTO memory (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP", [req.body.key, req.body.value]);
    res.json({ success: true });
});
app.delete('/api/memory/:key', async (req, res) => {
    await dbRun('DELETE FROM memory WHERE key = ?', [req.params.key]);
    res.json({ success: true });
});

// ─── OAUTH FLOW ───────────────────────────────────────────────────────────────
app.get('/api/auth/callback', async (req, res) => {
    const { code, state: serverId, error } = req.query;
    if (error) return res.status(400).send(`Auth Error: ${error}`);
    if (!code || !serverId) return res.status(400).send('Missing code or serverId');

    const server = getServerById(serverId);
    if (!server) return res.status(404).send('Server not found');

    const creds = await credStore.get(serverId);
    const clientId = creds?.envVars?.GOOGLE_CLIENT_ID || creds?.envVars?.LINKEDIN_CLIENT_ID;
    const clientSecret = creds?.envVars?.GOOGLE_CLIENT_SECRET || creds?.envVars?.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) return res.status(400).send('Client credentials missing in store. Please save Client ID/Secret in settings first.');

    try {
        const redirectUri = `http://localhost:${PORT}/api/auth/callback`;
        const tokenRes = await fetch(server.tokenUri, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        const tokens = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(tokens.error_description || tokens.error || 'Token exchange failed');

        // Save tokens to credential store
        const envVars = { ...creds.envVars, ...tokens };
        
        // Specialized logic for Google servers (they expect file paths)
        if (serverId.includes('google') || serverId === 'gmail') {
            const credPath = path.join(__dirname, `google_creds_${serverId}.json`);
            const tokenPath = path.join(__dirname, `google_token_${serverId}.json`);
            
            const googleCreds = {
                installed: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    auth_uri: server.authUri,
                    token_uri: server.tokenUri
                }
            };
            
            // Gmail MCP server expects a specific structure for tokens
            const googleToken = {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                scope: tokens.scope,
                token_type: tokens.token_type,
                expiry_date: Date.now() + (tokens.expires_in * 1000)
            };

            writeFileSync(credPath, JSON.stringify(googleCreds, null, 2));
            writeFileSync(tokenPath, JSON.stringify(googleToken, null, 2));

            // Map the expected env var to the file path
            const envKey = server.envVars[0]; // e.g., GMAIL_CREDENTIALS_PATH
            envVars[envKey] = credPath;
        }

        await credStore.save(serverId, envVars, true);
        
        // Live update MCP server if running
        if (systemRunning && mcp) {
            try {
                const allEnabled = await credStore.getAllEnabled();
                const fullEnv = { ...process.env };
                allEnabled.forEach(c => Object.assign(fullEnv, c.envVars));
                await mcp.connectServer(serverId, server.command, server.args, fullEnv);
            } catch (reconnectErr) {
                console.warn(`OAuth re-connect failed for ${serverId}:`, reconnectErr.message);
            }
        }

        res.send(`
            <html>
                <body style="font-family:sans-serif; text-align:center; padding:50px; background:#0f172a; color:#f8fafc;">
                    <div style="background:#1e293b; padding:30px; border-radius:12px; display:inline-block; border:1px solid #334155; max-width:400px">
                        <h2 style="color:#38bdf8;">✅ Authentication Successful!</h2>
                        <p>Successfully connected to <b>${server.name}</b>.</p>
                        <p style="font-size:14px; color:#94a3b8">The integration has been updated and is now active in the system.</p>
                        <div style="margin-top:25px; display:flex; flex-direction:column; gap:10px">
                            <a href="/" style="background:#38bdf8; color:#0f172a; text-decoration:none; padding:12px 20px; border-radius:6px; font-weight:bold;">Return to Dashboard</a>
                            <button onclick="window.close()" style="background:transparent; color:#94a3b8; border:1px solid #334155; padding:8px 20px; border-radius:6px; cursor:pointer;">Close Tab</button>
                        </div>
                    </div>
                </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send(`Token Exchange Failed: ${e.message}`);
    }
});

app.get('/api/auth/:serverId', async (req, res) => {
    const { serverId } = req.params;
    const server = getServerById(serverId);
    if (!server || server.authType !== 'oauth') return res.status(404).send('OAuth not supported for this server');

    const creds = await credStore.get(serverId);
    const clientId = creds?.envVars?.GOOGLE_CLIENT_ID || creds?.envVars?.LINKEDIN_CLIENT_ID;
    
    if (!clientId) return res.status(400).send('Client ID missing. Please configure it in the integration settings first.');

    const redirectUri = `http://localhost:${PORT}/api/auth/callback`;
    const authUrl = `${server.authUri}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(server.scopes.join(' '))}&state=${serverId}&access_type=offline&prompt=consent`;
    
    res.redirect(authUrl);
});

// ─── BOOT ─────────────────────────────────────────────────────────────────────
async function boot() {
    await initDb();
    await credStore.init();
    app.listen(PORT, () => console.log(`🌐 Dashboard: http://localhost:${PORT}`));
}

// ─── CLEANUP ──────────────────────────────────────────────────────────────────
async function shutdown() {
    console.log('\n[System] Graceful shutdown initiated...');
    if (mcp) await mcp.cleanup();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

boot().catch(console.error);
