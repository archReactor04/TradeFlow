import { db } from '@/db';

export const AVAILABLE_MODELS = [
  { id: 'gpt-5.2', label: 'GPT-5.2', description: 'Flagship model -- best balance of capability and cost' },
  { id: 'gpt-5.2-pro', label: 'GPT-5.2 Pro', description: 'Extra compute for deeper reasoning' },
  { id: 'gpt-5-mini', label: 'GPT-5 Mini', description: 'Faster and cheaper for quick questions' },
];

export const DEFAULT_MODEL = 'gpt-5.2';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const SYSTEM_PROMPT = `You are Jesse, an expert stock, futures, and options market trader and trading coach with decades of experience across equities, ES/NQ/YM futures, crude oil, gold, and options strategies. You have access to the user's complete trading journal data provided below.

Your role:
- Analyze their trades, identify patterns (both strengths and weaknesses), and provide actionable insights
- Reference actual numbers, dates, symbols, and strategies from their data -- be specific, not generic
- Assess risk management: position sizing, win/loss ratios, drawdowns, streaks, and exposure
- Identify behavioral patterns: overtrading, revenge trading, time-of-day biases, holding losers too long
- Suggest concrete improvements to their trading plan
- When asked about market concepts, explain them clearly with examples from their own trades when possible
- Flag any red flags immediately (outsized losses, poor risk/reward, deteriorating win rate)

When chart screenshots are provided, analyze the visible price action, candlestick patterns, support/resistance levels, and volume. Correlate what you see in the charts with the user's entry/exit points and trade outcomes. Point out what the chart shows about their timing, and suggest what they could look for next time.

Tone: Direct, confident, and supportive -- like a senior trader mentoring a junior one. Use trading terminology naturally. Keep responses focused and actionable.

Formatting rules:
- Use markdown for clear structure: headings (##), bold (**key points**), bullet lists, and numbered lists
- Break long analyses into clear sections with headings
- Use bullet points for lists of observations or recommendations
- Put key numbers and metrics in bold
- Keep paragraphs short (2-3 sentences max) for readability
- Use tables when comparing multiple items (symbols, strategies, etc.)
- End with a clear takeaway or action item when giving advice`;

export async function getSetting(key) {
  const row = await db.settings.get(key);
  return row?.value ?? null;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}

export async function getApiKey() {
  return getSetting('openai_api_key');
}

export async function setApiKey(key) {
  return setSetting('openai_api_key', key);
}

export async function getModel() {
  const model = await getSetting('openai_model');
  return model || DEFAULT_MODEL;
}

export async function setModel(model) {
  return setSetting('openai_model', model);
}

export async function streamChat(messages, { onToken, onDone, onError }) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    onError?.(new Error('OpenAI API key not configured. Please add your key in the settings above.'));
    return;
  }

  const model = await getModel();

  let response;
  try {
    response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_completion_tokens: 2048,
      }),
    });
  } catch (err) {
    onError?.(new Error('Network error -- check your internet connection.'));
    return;
  }

  if (!response.ok) {
    const status = response.status;
    if (status === 401) {
      onError?.(new Error('Invalid API key. Please check your OpenAI API key in settings.'));
    } else if (status === 429) {
      onError?.(new Error('Rate limit exceeded. Please wait a moment and try again.'));
    } else if (status === 404) {
      onError?.(new Error(`Model "${model}" not found. Try switching to a different model in settings.`));
    } else {
      let body = '';
      try { body = await response.text(); } catch {}
      onError?.(new Error(`OpenAI API error (${status}): ${body || 'Unknown error'}`));
    }
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          onDone?.();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) onToken?.(token);
        } catch {}
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(new Error('Stream interrupted. Please try again.'));
  }
}
