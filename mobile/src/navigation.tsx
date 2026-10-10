import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import { APP_URL } from './api';
import { t } from './i18n';
import CertificateScreen from './screens/CertificateScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import { colors } from './theme';

export type RootStackParamList = {
  Home: undefined;
  Register: { eventCode: string };
  Confirm: { eventCode: string; fullName: string; phone: string };
  Certificate: { ref: string; isNew?: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Scanning the printed QR with the normal camera opens the website; if this app is installed the same
// https link opens here instead. The web experience always works without the app.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [APP_URL, 'certs://'],
  config: { screens: { Home: '', Register: 'register/:eventCode', Certificate: 'certificate/:ref' } },
};

export default function Navigation() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.navy,
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 20 },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerTitle: () => <Image source={require('../assets/logo.png')} style={{ width: 168, height: 37 }} resizeMode="contain" accessibilityLabel="We The Leaders - Lead The Change" /> }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('getCertificate') }} />
        <Stack.Screen name="Confirm" component={ConfirmScreen} options={{ title: t('checkName') }} />
        <Stack.Screen name="Certificate" component={CertificateScreen} options={{ title: t('certificateTitle') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
