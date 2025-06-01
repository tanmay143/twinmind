import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseInit';

const { width, height } = Dimensions.get('window');

export default function CalendarScreen() {
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.items) {
          const grouped = {};
          data.items.forEach((event) => {
            const start = new Date(event.start?.dateTime || event.start?.date);
            const dateKey = start.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(event);
          });

          setEventsByDate(grouped);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatTimeRange = (startStr, endStr) => {
    if (!startStr || !endStr) return '';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const format = { hour: 'numeric', minute: 'numeric' };
    return `${start.toLocaleTimeString([], format)} - ${end.toLocaleTimeString([], format)}`;
  };

  const renderGroupedEvents = () => {
    return Object.entries(eventsByDate).map(([date, events]) => (
      <View key={date}>
        <Text style={styles.dateHeader}>{date}</Text>
        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>
                {formatTimeRange(event.start?.dateTime, event.end?.dateTime)}
              </Text>
            </View>
            <View style={styles.descriptionBox}>
              <Text numberOfLines={2} style={styles.eventTitle}>
                {event.summary || 'No Title'}
              </Text>
              <Text numberOfLines={1} style={styles.ellipsis}>...</Text>
            </View>
          </View>
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: height * 0.05 }}>
          {renderGroupedEvents()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: width * 0.04,
  },
  dateHeader: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginVertical: height * 0.015,
    color: '#333',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: width * 0.03,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  timeBox: {
    width: width * 0.22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.03,
  },
  timeText: {
    fontSize: width * 0.035,
    color: '#555',
    textAlign: 'center',
  },
  descriptionBox: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: width * 0.04,
    fontWeight: '500',
    color: '#222',
  },
  ellipsis: {
    color: '#bbb',
    fontSize: width * 0.05,
    lineHeight: width * 0.05,
  },
});
