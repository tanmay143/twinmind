import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseInit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatWithMemoryScreen from './ChatWithMemoryScreen';
import { useNavigation } from '@react-navigation/native';

export default function AskAllMemoriesScreen() {
  const navigation = useNavigation();
  const [combinedMemory, setCombinedMemory] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTranscripts = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if (!userEmail) return;

        const q = query(collection(db, 'memories'), where('user', '==', userEmail));
        const snapshot = await getDocs(q);

        const allText = snapshot.docs
          .map(doc => doc.data().fullText)
          .filter(Boolean)
          .join('\n\n---\n\n');

        setCombinedMemory({
          id: 'all-memories',      // mock ID
          fullText: allText,       // ✅ used directly in askGPT
          transcripts: []          // optional fallback
        });
      } catch (err) {
        console.error('Error fetching all transcripts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTranscripts();
  }, []);

  if (loading || !combinedMemory) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ChatWithMemoryScreen
      memory={combinedMemory} // ✅ pass full memory object
      chatLog={chatLog}
      setChatLog={setChatLog}
      onClose={() => {
        setChatLog([]);
        navigation.navigate('Calendar');
      }}
    />
  );
}
