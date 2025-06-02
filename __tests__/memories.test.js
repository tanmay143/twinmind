// __tests__/memories.test.js

import { fetchMemoriesForUser } from '../src/services/memoryService';
import { getDocs, query, where, collection } from 'firebase/firestore';

// Mock Firestore methods
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock the db export from firebaseInit
jest.mock('../src/services/firebaseInit', () => ({
  db: 'mock-db',
}));

describe('fetchMemoriesForUser', () => {
  it('should return formatted memory documents', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'mem1', data: () => ({ summary: 'Summary 1', fullText: 'Full text 1' }) },
        { id: 'mem2', data: () => ({ summary: 'Summary 2', fullText: 'Full text 2' }) },
      ],
    });

    const memories = await fetchMemoriesForUser('test@example.com');

    expect(collection).toHaveBeenCalledWith('mock-db', 'memories');
    expect(where).toHaveBeenCalledWith('user', '==', 'test@example.com');
    expect(memories).toEqual([
      { id: 'mem1', summary: 'Summary 1', fullText: 'Full text 1' },
      { id: 'mem2', summary: 'Summary 2', fullText: 'Full text 2' },
    ]);
  });

  it('should return an empty array if no docs', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });

    const memories = await fetchMemoriesForUser('no-user@example.com');

    expect(memories).toEqual([]);
  });
});
