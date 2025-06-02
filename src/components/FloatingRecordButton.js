// components/FloatingRecordButton.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toggleRecording } from '../services/whisperSync';

export default function FloatingRecordButton() {
  const [recording, setRecording] = useState(false);

  return (
    <View style={styles.floatingWrapper}>
      <TouchableOpacity
        style={[styles.recordButton, recording && styles.stopButton]}
        onPress={() => toggleRecording(setRecording)}
      >
        <Ionicons
          name={recording ? 'stop-outline' : 'mic-outline'}
          size={20}
          color="white"
        />
        <Text style={styles.recordButtonText}>
          {recording ? 'Stop' : 'Record'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 70,
    right: 24,
    zIndex: 100,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 50,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  recordButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
