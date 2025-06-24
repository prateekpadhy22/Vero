import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import * as Speech from 'expo-speech';
import { recordAudio, stopRecording } from './src/services/audio';
import { transcribeAudio } from './src/services/whisper';
import { callChat } from './src/services/chat';

export default function App() {
  // Track current workflow state: idle -> recording -> processing
  const [state, setState] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [userText, setUserText] = useState<string>('');
  const [reply, setReply] = useState<string>('');

  const handleTalk = async () => {
    try {
      setState('recording');
      const recording = await recordAudio();

      // Auto-stop after 5s
      setTimeout(async () => {
        const uri = await stopRecording(recording);
        setState('processing');

        const text = await transcribeAudio(uri);
        setUserText(text);

        const botReply = await callChat(text);
        setReply(botReply);
        Speech.speak(botReply);
        setState('idle');
      }, 5000);
    } catch (error) {
      console.error(error);
      setState('idle');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vero</Text>
      <Button
        title={
          state === 'idle'
            ? 'Talk'
            : state === 'recording'
            ? 'Recording…'
            : 'Processing…'
        }
        onPress={handleTalk}
        disabled={state !== 'idle'}
      />
      {state === 'processing' && <ActivityIndicator style={{ margin: 16 }} />}

      <Text style={styles.label}>You said:</Text>
      <Text style={styles.text}>{userText}</Text>

      <Text style={styles.label}>Vero replies:</Text>
      <Text style={styles.text}>{reply}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 20 },
  label: { marginTop: 16, fontWeight: '600' },
  text: { marginTop: 8, fontSize: 16 }
});