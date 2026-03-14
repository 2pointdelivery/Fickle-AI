import { dbRun, dbGet, dbAll } from './db.js';

/**
 * Stores and retrieves credentials for MCP servers securely in SQLite.
 * Note: For production, use encrypted storage.
 */
export class CredentialStore {
    async init() {
        await dbRun(`
            CREATE TABLE IF NOT EXISTS credentials (
                id TEXT PRIMARY KEY,
                env_vars TEXT,
                enabled INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async save(serverId, envVars, enabled = true) {
        const envStr = JSON.stringify(envVars);
        await dbRun(`
            INSERT INTO credentials (id, env_vars, enabled) VALUES (?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET env_vars = excluded.env_vars, enabled = excluded.enabled, updated_at = CURRENT_TIMESTAMP
        `, [serverId, envStr, enabled ? 1 : 0]);
    }

    async get(serverId) {
        const row = await dbGet('SELECT * FROM credentials WHERE id = ?', [serverId]);
        if (!row) return null;
        return {
            ...row,
            envVars: JSON.parse(row.env_vars),
            enabled: row.enabled === 1
        };
    }

    async getAll() {
        const rows = await dbAll('SELECT * FROM credentials');
        return rows.map(r => ({
            ...r,
            envVars: JSON.parse(r.env_vars),
            enabled: r.enabled === 1
        }));
    }

    async getAllEnabled() {
        const rows = await dbAll('SELECT * FROM credentials WHERE enabled = 1');
        return rows.map(r => ({
            ...r,
            envVars: JSON.parse(r.env_vars),
            enabled: true
        }));
    }

    async toggle(serverId, enabled) {
        await dbRun('UPDATE credentials SET enabled = ? WHERE id = ?', [enabled ? 1 : 0, serverId]);
    }

    async delete(serverId) {
        await dbRun('DELETE FROM credentials WHERE id = ?', [serverId]);
    }
}
