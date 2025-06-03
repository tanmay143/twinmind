// __tests__/whisperSync.test.js
import { uploadToWhisper } from '../src/services/whisperSync';

describe('uploadToWhisper', () => {
  const mockChunk = {
    id: 12345,
    filePath: 'file://mock-audio.wav',
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return transcript text from Whisper API', async () => {
    const fakeResponse = { text: 'Hello world from Whisper' };
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(fakeResponse),
    });

    const result = await uploadToWhisper(mockChunk);

    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/audio/transcriptions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer\s.+/),
          'Content-Type': 'multipart/form-data',
        }),
        body: expect.any(FormData),
      })
    );

    expect(result).toEqual(fakeResponse);
  });

  it('should return null if fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await uploadToWhisper(mockChunk);
    expect(result).toBeNull();
  });
});
