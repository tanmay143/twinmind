module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo|expo-asset|expo-av|expo-constants|expo-file-system|expo-font|expo-modules-core|expo-sqlite|firebase|@firebase|@expo|react-native|@react-native|@react-navigation|react-native-tab-view)/)',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    __DEV__: true,
  },
};
