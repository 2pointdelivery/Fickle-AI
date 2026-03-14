import { dbRun, dbGet, dbAll } from './db.js';

export class QueueManager {
    constructor() {
        this.workers = new Map();
    }

    async addJob(type, payload) {
        const payloadStr = JSON.stringify(payload);
        const result = await dbRun(
            `INSERT INTO tasks (type, status, payload) VALUES (?, 'pending', ?)`,
            [type, payloadStr]
        );
        // Note: SQLite dbRun might not return lastID directly with promisify if not careful, 
        // but for our purposes, polling will find it.
        console.log(`Job added: ${type}`);
    }

    async getNextJob() {
        return await dbGet(
            `SELECT * FROM tasks WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`
        );
    }

    async updateJobStatus(id, status, result = null) {
        const completedAt = status === 'completed' ? new Date().toISOString() : null;
        await dbRun(
            `UPDATE tasks SET status = ?, result = ?, completed_at = ? WHERE id = ?`,
            [status, JSON.stringify(result), completedAt, id]
        );
    }

    registerWorker(type, handler) {
        this.workers.set(type, handler);
    }

    async processJobs() {
        const job = await this.getNextJob();
        if (job) {
            console.log(`Processing job ${job.id}: ${job.type}`);
            await this.updateJobStatus(job.id, 'processing');
            
            const handler = this.workers.get(job.type);
            if (handler) {
                try {
                    const result = await handler(JSON.parse(job.payload));
                    await this.updateJobStatus(job.id, 'completed', result);
                    console.log(`Job ${job.id} completed.`);
                } catch (error) {
                    console.error(`Job ${job.id} failed:`, error);
                    await this.updateJobStatus(job.id, 'failed', { error: error.message });
                }
            } else {
                console.warn(`No worker for job type: ${job.type}`);
                await this.updateJobStatus(job.id, 'failed', { error: 'No worker registered' });
            }
        }
    }

    startPolling(interval = 5000) {
        setInterval(() => this.processJobs(), interval);
        console.log(`Queue polling started (${interval}ms).`);
    }

    getStatus() {
        return {
            active: true,
            workers: Array.from(this.workers.keys()),
            workerCount: this.workers.size
        };
    }
}
