import Constants from 'expo-constants';
import { OPENAI_API_KEY } from '@env';

/**
 * Send raw audio file to OpenAI Whisper API for transcription.
 * - Uses fetch with FormData
 * - Expects JSON response with `text` field
 */
export async function transcribeAudio(
  uri: string
): Promise<string> {
  // Load API key
  const apiKey =
    OPENAI_API_KEY || Constants.manifest?.extra?.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not defined');

  // Build multipart form data
  const formData = new FormData();
  formData.append('file', { uri, name: 'speech.m4a', type: 'audio/m4a' } as any);
  formData.append('model', 'whisper-1');

  // Call transcription endpoint
  const res = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Whisper transcription failed: ${errText}`);
  }

  const data = await res.json();
  return data.text as string;
}