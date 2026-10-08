import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { eventCodeFromScan } from '../api';
import { Banner, Button, Field, Heading, Lead, Screen } from '../components/ui';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const handled = useRef(false);

  function open(value: string) {
    const eventCode = eventCodeFromScan(value);
    setScanning(false);
    if (!eventCode) return setError(t('error.EVENT_NOT_FOUND'));
    setError('');
    navigation.navigate('Register', { eventCode });
  }

  async function startScan() {
    if (!permission?.granted && !(await requestPermission()).granted) return setError(t('scanNeedsCamera'));
    handled.current = false;
    setScanning(true);
  }

  if (scanning) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (handled.current) return;
            handled.current = true;
            open(data);
          }}
        />
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 24 }}>
          <Button title={t('cancel')} secondary onPress={() => setScanning(false)} />
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <Heading>{t('homeTitle')}</Heading>
      <Lead>{t('homeText')}</Lead>
      {!!error && <Banner kind="bad">{error}</Banner>}
      <Button title={t('scanQr')} onPress={startScan} />
      <View style={{ height: 24 }} />
      <Field
        label={t('eventCode')}
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder={t('eventCodePlaceholder')}
      />
      <Button title={t('continue')} secondary onPress={() => open(code)} />
    </Screen>
  );
}
