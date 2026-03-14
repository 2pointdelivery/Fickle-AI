import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class MCPManager {
    constructor() {
        this.clients = new Map();
        this.processes = new Map(); // name -> child_process
        this.tools = [];
        this.serverStatus = new Map(); // { status: 'idle'|'connected'|'error', error: null, config: { command, args, env } }
        this.heartbeatTimer = setInterval(() => this.checkHeartbeats(), 30000);
    }

    async connectServer(name, command, args = [], env = {}) {
        // Don't connect the same server twice
        if (this.clients.has(name)) {
            console.log(`MCP server already connected: ${name}`);
            return;
        }

        try {
            this.serverStatus.set(name, { status: 'connecting', error: null, config: { command, args, env } });
            const transport = new StdioClientTransport({
                command,
                args,
                env: { ...process.env, ...env },
            });

            const client = new Client(
                { name: "fickle-orchestrator", version: "1.0.0" },
                { capabilities: { tools: {} } }
            );

            await client.connect(transport);
            
            // Track the process via internal transport property (if available/accessible)
            // StdioClientTransport uses child_process.spawn internally but doesn't expose it directly in a standard way
            // However, we can track that it IS connected.
            
            this.clients.set(name, client);

            const { tools } = await client.listTools();
            // Remove any old tools from this server in case of reconnect
            this.tools = this.tools.filter(t => t.serverName !== name);
            this.tools.push(...tools.map(t => ({ ...t, serverName: name })));

            this.serverStatus.set(name, { status: 'connected', error: null, config: { command, args, env } });
            console.log(`✅  MCP server connected: ${name} (${tools.length} tools)`);
        } catch (error) {
            this.serverStatus.set(name, { status: 'error', error: error.message, config: { command, args, env } });
            console.error(`❌  Failed to connect MCP server "${name}":`, error.message);
        }
    }

    async checkHeartbeats() {
        for (const [name, status] of this.serverStatus.entries()) {
            if (status.status === 'connected' && !this.clients.has(name)) {
                console.log(`[MCP] Heartbeat: ${name} appears disconnected. Attempting auto-recovery...`);
                const { command, args, env } = status.config;
                await this.connectServer(name, command, args, env);
            }
        }
    }

    getStatusMap() {
        return Object.fromEntries(this.serverStatus);
    }

    getTools() {
        return this.tools;
    }

    listConnected() {
        return [...this.clients.keys()];
    }

    isConnected(name) {
        return this.clients.has(name);
    }

    async callTool(serverName, toolName, args) {
        const client = this.clients.get(serverName);
        if (!client) throw new Error(`MCP Server "${serverName}" not connected`);
        return await client.callTool({ name: toolName, arguments: args });
    }

    async disconnect(name) {
        const client = this.clients.get(name);
        if (client) {
            try { await client.close(); } catch (e) { /* ignore */ }
            this.clients.delete(name);
            this.tools = this.tools.filter(t => t.serverName !== name);
            this.serverStatus.delete(name);
            console.log(`MCP server disconnected: ${name}`);
        }
    }

    async cleanup() {
        console.log('[MCP] Shutting down all MCP servers...');
        clearInterval(this.heartbeatTimer);
        for (const name of this.clients.keys()) {
            await this.disconnect(name);
        }
    }
}
