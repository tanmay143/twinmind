import NetInfo from '@react-native-community/netinfo';

export const setupConnectivityListener = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncUnsyncedChunks();
    }
  });
};
