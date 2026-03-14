import { Ollama } from 'ollama';

export function createWorker(type, orchestrator) {
    const client = new Ollama({ host: orchestrator.host });

    const systemPrompts = {
        dev: `You are the Fickle AI Dev Worker. You are a senior full-stack engineer.
When given a task, produce concrete output: code, commands, file contents, or architecture plans.`,
        marketing: `You are the Fickle AI Marketing Worker. You are an expert growth marketer.
When given a task, produce concrete output: copy, strategies, ad scripts, email drafts, or campaign plans.`,
        support: `You are the Fickle AI Support Worker. You handle customer inquiries with empathy and precision.
When given a task, draft responses, FAQ entries, or resolution strategies.`,
    };

    return async (jobData) => {
        console.log(`\n🔧  Worker [${type.toUpperCase()}] executing: "${jobData.description}"`);

        try {
            const response = await client.chat({
                model: orchestrator.model,
                messages: [
                    { role: 'system', content: systemPrompts[type] ?? `You are a ${type} specialist.` },
                    { role: 'user', content: `Complete this business task:\n\n${jobData.description}` }
                ]
            });

            console.log(`✅  Worker [${type.toUpperCase()}] done.`);
            return {
                status: 'success',
                type,
                description: jobData.description,
                output: response.message.content,
            };
        } catch (e) {
            console.error(`❌  Worker [${type.toUpperCase()}] failed:`, e.message);
            throw e;
        }
    };
}
