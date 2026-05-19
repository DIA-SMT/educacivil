import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { createClient } from '@/utils/supabase/server';

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 30;

const DAILY_LIMIT = 6;
const MAX_USER_MESSAGE_CHARS = 2000;
const MAX_OUTPUT_TOKENS = 800;

function extractLastUserText(messages: UIMessage[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (m.role !== 'user') continue;
        const parts: any[] = (m as any).parts ?? [];
        return parts
            .filter((p) => p?.type === 'text' && typeof p.text === 'string')
            .map((p) => p.text)
            .join('');
    }
    return '';
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages, guideId }: { messages: UIMessage[]; guideId: string } = await req.json();
        if (!guideId) {
            return new Response('Missing guideId', { status: 400 });
        }

        // 2. Validar tamaño del último mensaje del usuario
        const lastUserText = extractLastUserText(messages);
        if (lastUserText.length > MAX_USER_MESSAGE_CHARS) {
            return new Response(
                `Tu mensaje supera el máximo de ${MAX_USER_MESSAGE_CHARS} caracteres.`,
                { status: 413 }
            );
        }

        // 3. Cargar el asistente
        const { data: guide, error: guideErr } = await supabase
            .from('ai_guides')
            .select('id, system_prompt, title')
            .eq('id', guideId)
            .single();

        if (guideErr || !guide) {
            return new Response('Guide not found', { status: 404 });
        }

        // 4. Rate limit atómico vía RPC
        const { error: rpcErr } = await supabase.rpc('increment_chat_usage', {
            p_guide_id: guide.id,
            p_limit: DAILY_LIMIT,
        });
        if (rpcErr) {
            if (rpcErr.code === 'P0001') {
                return new Response(
                    `Alcanzaste el límite diario de ${DAILY_LIMIT} mensajes para este asistente. Volvé a intentarlo mañana.`,
                    { status: 429 }
                );
            }
            console.error('Rate limit RPC error:', rpcErr);
            return new Response('Internal error', { status: 500 });
        }

        // 5. Llamar al modelo
        const systemPrompt =
            guide.system_prompt ||
            `Eres un asistente experto llamado "${guide.title}". Responde siempre en español, de forma clara y útil.`;

        const modelMessages = await convertToModelMessages(messages);

        const result = streamText({
            model: openrouter(process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'),
            system: systemPrompt,
            messages: modelMessages,
            temperature: 0.7,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('API Chat Error:', error);
        return new Response('An error occurred during chat.', { status: 500 });
    }
}
