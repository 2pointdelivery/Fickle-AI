import { dbAll } from './db.js';

async function monitor() {
    console.clear();
    console.log('--- Fickle AI Activity Monitor ---');
    console.log('Time:', new Date().toLocaleString());
    console.log('---------------------------------');

    const tasks = await dbAll('SELECT * FROM tasks ORDER BY created_at DESC LIMIT 10');
    
    if (tasks.length === 0) {
        console.log('No tasks found.');
    } else {
        tasks.forEach(t => {
            const statusIcon = t.status === 'completed' ? '✅' : (t.status === 'pending' ? '⏳' : '🚀');
            console.log(`${statusIcon} [${t.type}] - ${t.status} - ${t.created_at}`);
            const payload = JSON.parse(t.payload);
            console.log(`   Task: ${payload.description}`);
            if (t.result) {
                const res = JSON.parse(t.result);
                console.log(`   Result: ${res.status || 'Done'}`);
            }
            console.log('---');
        });
    }

    const memory = await dbAll('SELECT * FROM memory');
    console.log('\n--- Persistent Memory ---');
    memory.forEach(m => {
        console.log(`${m.key}: ${m.value}`);
    });
}

setInterval(monitor, 3000);
monitor();
