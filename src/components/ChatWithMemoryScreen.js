import React, { useState, useRef, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseInit';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OPENAI_API_KEY } from '@env';

const { width, height } = Dimensions.get('window');

export default function ChatWithMemoryScreen({ memory, chatLog, setChatLog, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const askGPT = async () => {
  console.log('📌 memory.id:', memory?.id);

  if (!query.trim()) return;
  
  let currentText = memory.fullText?.trim() || '';

  // 🔁 If memoryText is missing, refetch the memory document
  if (!currentText && memory?.id) {
    try {
      const snapshot = await getDoc(doc(db, 'memories', memory.id));
      const latest = snapshot.data();

      if (latest?.fullText?.trim()) {
        currentText = latest.fullText.trim();
      } else if (Array.isArray(latest?.transcripts)) {
        currentText = latest.transcripts.map(t => t.text).join(' ').trim();
      }
    } catch (err) {
      console.error('❌ Failed to fetch updated memory from Firestore:', err);
    }
  }
  console.log(currentText)

  const currentQuestion = query;
  setQuery('');
  setLoading(true);
  setChatLog(prev => [...prev, { q: currentQuestion, a: null }]);

  const prompt = `
    You are a helpful and knowledgeable assistant. Use the following meeting transcripts as your knowledge base to answer the user's question accurately and concisely.

    Meeting Notes:
    """
    ${currentText}
    """

    Now, based on the above information, answer the following user query:

    User: ${currentQuestion}
  `;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant summarizing meeting notes.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const json = await res.json();
    const answer = json.choices?.[0]?.message?.content || 'No response.';
    setChatLog(prev => {
      const updated = [...prev];
      updated[updated.length - 1].a = answer;
      return updated;
    });
  } catch (err) {
    setChatLog(prev => {
      const updated = [...prev];
      updated[updated.length - 1].a = '❌ Error retrieving response.';
      return updated;
    });
  }

  setLoading(false);
};

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [chatLog, loading]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chat with Memory</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: height * 0.12 }}
      >
        {chatLog.map((item, index) => (
          <View key={index} style={styles.chatBubble}>
            <View style={styles.userBubble}>
              <Text style={styles.label}>🧍‍♀️ You</Text>
              <Text style={styles.text}>{item.q}</Text>
            </View>
            <View style={styles.assistantBubble}>
              <Text style={styles.label}>🤖 Assistant</Text>
              <Text style={styles.text}>
                {item.a === null ? '💬 Assistant is thinking...' : item.a}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          placeholder="Ask a question..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={askGPT} disabled={loading}>
          <Ionicons name="send" size={24} color={loading ? 'gray' : '#007AFF'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    backgroundColor: '#f7f7f7',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatBubble: {
    marginBottom: height * 0.025,
  },
  userBubble: {
    backgroundColor: '#d0e8ff',
    padding: width * 0.04,
    borderRadius: 10,
    alignSelf: 'flex-end',
    maxWidth: width * 0.8,
  },
  assistantBubble: {
    backgroundColor: '#f2f2f2',
    padding: width * 0.04,
    borderRadius: 10,
    alignSelf: 'flex-start',
    maxWidth: width * 0.85,
    marginTop: height * 0.01,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
});
