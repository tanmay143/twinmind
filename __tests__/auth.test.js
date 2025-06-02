import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';



jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
test('basic test works', () => {
  expect(true).toBe(true);
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    signIn: jest.fn(),
    hasPlayServices: jest.fn(),
    getTokens: jest.fn(),
  },
}));
