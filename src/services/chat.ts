import Constants from 'expo-constants';
import { OPENAI_API_KEY } from '@env';

/**
 * Send a chat prompt to OpenAI's Chat Completion API
 * - Uses GPT-3.5-turbo by default
 * - Returns the assistant's textual reply
 */
export async function callChat(
  prompt: string
): Promise<string> {
  const apiKey =
    OPENAI_API_KEY || Constants.manifest?.extra?.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not defined');

  const response = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    }
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ChatGPT call failed: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}