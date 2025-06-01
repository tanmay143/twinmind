import * as SQLite from 'expo-sqlite';

let db;

export const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('transcription.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS audio_chunks (
        id INTEGER PRIMARY KEY,
        filePath TEXT NOT NULL,
        timestamp TEXT,
        isSynced INTEGER DEFAULT 0,
        transcript TEXT
      );
    `);
  }
  return db;
};

export const insertChunk = async (id, filePath, timestamp) => {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO audio_chunks (id, filePath, timestamp, isSynced, transcript) VALUES (?, ?, ?, 0, ?)',
    [id, filePath, timestamp, '']
  );
};

export const markChunkAsSynced = async (id, transcript) => {
  if (!id || typeof transcript !== 'string') {
    console.error('🛑 Invalid data passed to markChunkAsSynced:', { id, transcript });
    return;
  }
  const db = await getDB();
  await db.runAsync(
    'UPDATE audio_chunks SET isSynced = 1, transcript = ? WHERE id = ?',
    [transcript, id]
  );
};

export const getUnsyncedChunks = async () => {
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM audio_chunks WHERE isSynced = 0');
};

export const getTranscriptsForSession = async (startId, endId) => {
  const db = await getDB();
  return await db.getAllAsync(
    'SELECT transcript FROM audio_chunks WHERE id BETWEEN ? AND ? ORDER BY id ASC',
    [startId, endId]
  );
};
