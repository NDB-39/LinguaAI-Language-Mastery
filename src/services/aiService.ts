import { useStore } from '../store/useStore';

import { getCache, setCache } from '../lib/storage';

export const PROXY_URL = 'https://a52s.spritenguyen.workers.dev';

export type Message = { role: 'system' | 'user' | 'assistant', content: string };
export type GeminiMessage = { role: 'user' | 'model', parts: { text: string }[] };

// Dành cho Aria (Trợ lý) -> sử dụng Pollinations proxy
async function generateCacheKey(prefix: string, content: string) {
  try {
    const msgBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return prefix + '_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return prefix + '_' + hash.toString(36);
  }
}

export async function chatWithAria(messages: Message[]): Promise<string> {
  const cacheKey = await generateCacheKey('aria', JSON.stringify(messages));
  const cached = await getCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${PROXY_URL}/openai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: useStore.getState().progress.textModelId || 'openai',
        seed: Math.floor(Math.random() * 1000000)
      })
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    let result = '';
    
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (data.choices && data.choices[0]) {
        result = data.choices[0].message.content;
      } else {
        result = JSON.stringify(data);
      }
    } else {
      result = await res.text();
    }
    
    if (result) {
      await setCache(cacheKey, result);
    }
    return result;
  } catch (err) {
    console.error('chatWithAria error:', err);
    throw err;
  }
}

// Khả năng kế thừa cho các request đơn (như Path generator)
export async function askAI(system: string, user: string): Promise<string> {
  return chatWithAria([{ role: 'system', content: system }, { role: 'user', content: user }]);
}

// Dành cho Giáo viên AI -> sử dụng Gemini (backend endpoint)
export async function askTeacher(systemInstruction: string, messages: Message[], apiKey?: string): Promise<string> {
  const cacheKey = await generateCacheKey('teacher', systemInstruction + JSON.stringify(messages));
  const cached = await getCache<string>(cacheKey);
  if (cached) return cached;
  
  // Convert messages to Gemini format: user/assistant -> user/model
  const geminiMessages: GeminiMessage[] = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: geminiMessages,
        systemInstruction
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    if (data.text) {
      await setCache(cacheKey, data.text);
    }
    return data.text;
  } catch (err) {
    console.error('askTeacher error:', err);
    throw err;
  }
}

// Dành cho Pollinations Image
export function getPollinationsImageUrl(prompt: string, width = 800, height = 600) {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 1e6)}`;
}
