import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '893641278791-smrigbaecoc6gh4pfhof4pdumc465btu.apps.googleusercontent.com', // from Google Cloud
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
    offlineAccess: true,
  });
};
