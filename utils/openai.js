import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_KEY_STORAGE = 'OPENAI_API_KEY_V1';

export async function saveApiKey(key) {
  try {
    await AsyncStorage.setItem(OPENAI_KEY_STORAGE, key);
    return true;
  } catch (e) {
    console.error('Failed to save API key', e);
    return false;
  }
}

export async function getApiKey() {
  try {
    const k = await AsyncStorage.getItem(OPENAI_KEY_STORAGE);
    return k;
  } catch (e) {
    console.error('Failed to load API key', e);
    return null;
  }
}

export async function callOpenAI(prompt, apiKey) {
  if (!apiKey) throw new Error('No OpenAI API key provided');

  const body = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content || '';
  return reply.trim();
}
