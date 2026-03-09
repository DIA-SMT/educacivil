import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { createClient } from '@supabase/supabase-js';

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, guideId }: { messages: UIMessage[]; guideId: string } = await req.json();

        if (!guideId) {
            return new Response('Missing guideId', { status: 400 });
        }

        // Obtener el system_prompt de la base de datos para este agente específico
        const { data: guide, error } = await supabase
            .from('ai_guides')
            .select('system_prompt, title')
            .eq('id', guideId)
            .single();

        if (error || !guide) {
            return new Response('Guide not found', { status: 404 });
        }

        const systemPrompt = guide.system_prompt || `Eres un asistente experto llamado "${guide.title}". Responde siempre en español, de forma clara y útil.`;

        const modelMessages = await convertToModelMessages(messages);

        const result = streamText({
            model: openrouter(process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'),
            system: systemPrompt,
            messages: modelMessages,
            temperature: 0.7,
        });

        // toUIMessageStreamResponse es requerido por @ai-sdk/react v3 con useChat + DefaultChatTransport
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('API Chat Error:', error);
        return new Response('An error occurred during chat.', { status: 500 });
    }
}
