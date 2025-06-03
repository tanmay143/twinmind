// ✅ whispersync.js (handles short final chunk if <30s by reusing logic from recordChunk)
import * as FileSystem from 'expo-file-system';
import {
  getUnsyncedChunks,
  markChunkAsSynced,
  insertChunk,
  getTranscriptsForSession
} from './chunkDB';
import { OPENAI_API_KEY } from '@env';
import { Audio } from 'expo-av';
import { db } from './firebaseInit';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

let recording = null;
let isRecording = false;
let startId = null;

const isWhisperReachable = async () => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const toggleRecording = async (onRecordingStateChange) => {
  if (isRecording) {
    onRecordingStateChange(false);
    await stopAndProcessRecording();
    isRecording = false;
    
  } else {
    await startRecording();
    isRecording = true;
    onRecordingStateChange(true);
  }
};

export const startRecording = async () => {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recording = newRecording;

    const userEmail = await AsyncStorage.getItem('userEmail');
    const memoryRef = await addDoc(collection(db, 'memories'), {
      user: userEmail,
      createdAt: new Date().toISOString(),
      transcripts: [],
      summary: '',
      fullText: '',
    });

    await AsyncStorage.setItem('currentMemoryId', memoryRef.id);
    startId = Date.now();

    setTimeout(() => recordChunk(), 30000);
  } catch (err) {
    console.error('🎙️ Failed to start recording:', err);
  }
};

const processRecordingChunk = async (uri) => {
  const id = Date.now();
  const timestamp = new Date().toISOString();
  await insertChunk(id, uri, timestamp);

  const isReachable = await isWhisperReachable();
  if (isReachable) {
    const result = await uploadToWhisper({ id, filePath: uri });
    if (result?.text) {
      console.log(`📄 Transcript for chunk ${id}:`, result.text);
      await markChunkAsSynced(id, result.text);
      const memoryId = await AsyncStorage.getItem('currentMemoryId');
      await updateDoc(doc(db, 'memories', memoryId), {
        transcripts: arrayUnion({ id, text: result.text }),
      });
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  }
};

const recordChunk = async () => {
  try {
    if (!recording || !isRecording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (!uri) return;

    await processRecordingChunk(uri);

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recording = newRecording;

    if (isRecording) {
      setTimeout(() => recordChunk(), 30000);
    }
  } catch (error) {
    console.error('🔁 Error in recordChunk:', error);
  }
};

export const syncUnsyncedChunks = async () => {
  const reachable = await isWhisperReachable();
  if (!reachable) return;

  const unsyncedChunks = await getUnsyncedChunks();
  const memoryId = await AsyncStorage.getItem('currentMemoryId');

  for (const chunk of unsyncedChunks) {
    const result = await uploadToWhisper({ id: chunk.id, filePath: chunk.filePath });
    if (result?.text) {
      console.log(`📄 Synced transcript ${chunk.id}:`, result.text);
      await markChunkAsSynced(chunk.id, result.text);
      await updateDoc(doc(db, 'memories', memoryId), {
        transcripts: arrayUnion({ id: chunk.id, text: result.text }),
      });
      await FileSystem.deleteAsync(chunk.filePath, { idempotent: true });
    }
  }
};

export const uploadToWhisper = async (chunk) => {
  const formData = new FormData();
  formData.append('file', {
    uri: chunk.filePath,
    name: 'audio.wav',
    type: 'audio/wav',
  });
  formData.append('model', 'whisper-1');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Whisper upload failed:', error);
    return null;
  }
};

const stopAndProcessRecording = async () => {
  try {
    isRecording = false;
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recording = null;
      if (uri) await processRecordingChunk(uri); // handle final short chunk
    }

    await syncUnsyncedChunks();

    const endId = Date.now();
    const transcriptChunks = await getTranscriptsForSession(startId, endId);
    const fullText = transcriptChunks.map(t => t.transcript).join(' ').trim();
    console.log('🧩 Final fullText for summary:', fullText);

    const summary = await generateSummary(fullText);
    const memoryId = await AsyncStorage.getItem('currentMemoryId');
    if (memoryId) {
      await updateDoc(doc(db, 'memories', memoryId), {
        summary: summary,
        fullText: fullText,
      });
    }

    await AsyncStorage.removeItem('currentMemoryId');
  } catch (error) {
    console.error('❌ Error in stopAndProcessRecording:', error);
  }
};

const generateSummary = async (fullText) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Summarize this transcript of a meeting.' },
          { role: 'user', content: fullText },
        ],
      }),
    });
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  } catch (err) {
    console.error('⚠️ Error generating summary:', err);
    return '';
  }
};