import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseInit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatWithMemoryScreen from './ChatWithMemoryScreen';

const { height, width } = Dimensions.get('window');

export default function MemoriesScreen() {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatLog, setChatLog] = useState([]);

  const fetchMemories = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) return;

      const q = query(collection(db, 'memories'), where('user', '==', userEmail));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMemories(sorted);
    } catch (err) {
      console.error('Error fetching memories:', err);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const MemoryCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{new Date(item.createdAt).toLocaleString()}</Text>
      <Text numberOfLines={2} style={styles.cardSnippet}>
        {item.summary || item.fullText || 'No content yet'}
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => {
            setSelectedMemory(item);
            setShowDetailsModal(true);
          }}
        >
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardButton, { backgroundColor: '#007AFF' }]}
          onPress={() => {
            setActiveChat(item);
            setChatLog([]);
          }}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const DetailsModal = () => (
    <Modal visible={showDetailsModal} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={{ maxHeight: height * 0.6 }}>
            <Text style={styles.modalLabel}>Transcript</Text>
            <Text style={styles.modalText}>
              {selectedMemory?.fullText || '⏳ Still recording...'}
            </Text>
            <Text style={styles.modalLabel}>Summary</Text>
            <Text style={styles.modalText}>
              {selectedMemory?.summary || '💡 Summary will appear after recording ends'}
            </Text>
          </ScrollView>
          <TouchableOpacity
            onPress={() => {
              setSelectedMemory(null);
              setShowDetailsModal(false);
            }}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      {activeChat ? (
        <ChatWithMemoryScreen
          memoryText={activeChat?.fullText || ''}
          chatLog={chatLog}
          setChatLog={setChatLog}
          onClose={() => {
            setActiveChat(null);
            setChatLog([]);
          }}
        />
      ) : (
        <View style={styles.container}>
          <FlatList
            data={memories}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MemoryCard item={item} />}
            contentContainerStyle={{ paddingBottom: height * 0.1 }}
          />
          {showDetailsModal && <DetailsModal />}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardSnippet: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardButton: {
    flex: 0.48,
    paddingVertical: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  closeText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
});
