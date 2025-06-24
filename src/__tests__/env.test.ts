import Constants from 'expo-constants';
import { OPENAI_API_KEY } from '@env';

test('OPENAI_API_KEY is loaded correctly', () => {
  const key =
    OPENAI_API_KEY || Constants.manifest?.extra?.OPENAI_API_KEY;
  expect(key).toBeDefined();
  expect(key?.length).toBeGreaterThan(0);
});