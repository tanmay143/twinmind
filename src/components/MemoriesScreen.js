import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseInit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatWithMemoryScreen from './ChatWithMemoryScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const { height, width } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

function TranscriptTab({ text }) {
  return (
    <View style={styles.tabContainer}>
      <Text style={styles.modalText}>{text || '⏳ Still recording...'}</Text>
    </View>
  );
}

function SummaryTab({ text }) {
  return (
    <View style={styles.tabContainer}>
      <Text style={styles.modalText}>{text || '💡 Summary will appear after recording ends'}</Text>
    </View>
  );
}

export default function MemoriesScreen() {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMemories = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
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
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const MemoryCard = ({ item }) => {
    const date = new Date(item.createdAt);
    const dateStr = formatDate(date);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.cardContainer}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.timeText}>{timeStr}</Text>
            <Text style={styles.cardSnippet} numberOfLines={2}>
              {item.summary || item.fullText || 'No content yet'}
            </Text>
          </View>
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
              style={[styles.cardButton, { backgroundColor: '#2C597B' }]}
              onPress={() => {
                setActiveChat(item);
                setChatLog([]);
              }}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Chat</Text>

            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const DetailsModal = () => (
    <Modal visible={showDetailsModal} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Tab.Navigator>
            <Tab.Screen name="Transcript">
              {() => <TranscriptTab text={selectedMemory?.fullText} />}
            </Tab.Screen>
            <Tab.Screen name="Summary">
              {() => <SummaryTab text={selectedMemory?.summary} />}
            </Tab.Screen>
          </Tab.Navigator>
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
            refreshing={refreshing}
            onRefresh={() => fetchMemories(true)}
          />
          {showDetailsModal && <DetailsModal />}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  cardContainer: { marginBottom: 20 },
  dateText: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginRight: 12,
    minWidth: 60,
  },
  cardSnippet: {
    color: '#333',
    fontSize: 14,
    flexShrink: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
    flex: 0.8,
  },
  tabContainer: {
    flex: 1,
    padding: 12,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
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