import { Audio } from 'expo-av';

/**
 * Begin an audio recording.
 * - Requests microphone permission
 * - Prepares a high-quality recording
 * - Starts recording and returns the instance
 */
export async function recordAudio(): Promise<Audio.Recording> {
  // Ask the user for microphone permissions
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Audio permission not granted');
  }

  // Create and configure Recording
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  await recording.startAsync();
  return recording;
}

/**
 * Stop the given recording and unload it from memory.
 * Returns the local file URI for playback or upload.
 */
export async function stopRecording(
  recording: Audio.Recording
): Promise<string> {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  if (!uri) throw new Error('Failed to get recording URI');
  return uri;
}