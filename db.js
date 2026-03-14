import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const dbPath = './polsia.db';
const db = new sqlite3.Database(dbPath);

// Promisify database methods
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

export async function initDb() {
    await dbRun(`
        CREATE TABLE IF NOT EXISTS memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await dbRun(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            status TEXT,
            payload TEXT,
            result TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME
        )
    `);

    await dbRun(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT,
            message TEXT,
            source TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await seedDatabase();
    await checkIntegrity();
    console.log('Database initialized.');
}

async function checkIntegrity() {
    try {
        const memoryCount = await dbGet("SELECT COUNT(*) as count FROM memory");
        console.log(`[DB] Integrity Check: ${memoryCount.count} memory entries found.`);
    } catch (e) {
        console.error('[DB] Integrity Check Failed:', e.message);
    }
}

export async function logToDb(level, message, source) {
    try {
        await dbRun(
            "INSERT INTO logs (level, message, source) VALUES (?, ?, ?)",
            [level, message, source]
        );
    } catch (e) {
        console.error('[DB] Logging Failed:', e.message);
    }
}

async function seedDatabase() {
    const defaults = {
        'prompt_ceo': 'You are Fickle AI CEO. Analyze company status and define 3 high-level strategic tasks for the departments. Respond in JSON.',
        'prompt_operations': 'You are Fickle AI Ops Director. Manage logistics, delivery schedules, and inventory updates. Respond in JSON.',
        'prompt_marketing': 'You are Fickle AI Marketing Director. Generate social media content, ad copy, and brand growth strategies. Respond in JSON.',
        'prompt_outreach': 'You are Fickle AI Growth Director. Identify B2B leads and draft personalized cold outreach messages. Respond in JSON.',
        'prompt_support': 'You are Fickle AI Support Director. Resolve customer tickets and build FAQ context. Respond in JSON.',
        'prompt_fundraising': 'You are Fickle AI Fundraising Director. Track traction metrics and draft investor update emails. Respond in JSON.',
        'LOOP_INTERVALS': JSON.stringify({
            ceo: 3600000, 
            operations: 0, 
            marketing: 0, 
            outreach: 0, 
            support: 0, 
            fundraising: 0
        })
    };

    for (const [key, value] of Object.entries(defaults)) {
        await dbRun(`INSERT OR IGNORE INTO memory (key, value) VALUES (?, ?)`, [key, value]);
    }
}
