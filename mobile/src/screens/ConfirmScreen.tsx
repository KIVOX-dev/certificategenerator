import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ApiError, errorKey, registerForEvent } from '../api';
import { Banner, BigName, Button, Heading, Lead, Loading, Screen } from '../components/ui';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation';
import { normalizeIndianPhone } from '../validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirm'>;

export default function ConfirmScreen({ route, navigation }: Props) {
  const { eventCode, fullName, phone } = route.params;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'bad' | 'warn'; text: string } | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setMessage(null);
    try {
      const { outcome, certificate } = await registerForEvent(eventCode, fullName, phone);
      if (outcome === 'CREATED') return navigation.replace('Certificate', { ref: certificate.certificateId, isNew: true });
      setExistingId(outcome === 'EXISTING' ? certificate.certificateId : null);
      setMessage({ kind: 'warn', text: t(outcome === 'EXISTING' ? 'existingFound' : 'alreadyPreparing') });
    } catch (e) {
      if (e instanceof ApiError && (e.code === 'INVALID_NAME' || e.code === 'INVALID_PHONE')) return navigation.goBack();
      setMessage({ kind: 'bad', text: t(errorKey(e)) });
    } finally {
      setBusy(false);
    }
  }

  if (busy) {
    return (
      <Screen>
        <Loading text={t('creating')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Heading>{t('checkName')}</Heading>
      <Lead>{t('certificateWillBeCreatedFor')}</Lead>
      <BigName>{fullName}</BigName>
      <Lead>{t('phoneNumber')}:</Lead>
      <BigName>{normalizeIndianPhone(phone) ?? phone}</BigName>
      {message && <Banner kind={message.kind}>{message.text}</Banner>}
      {existingId ? (
        <Button title={t('viewMyCertificate')} onPress={() => navigation.replace('Certificate', { ref: existingId })} />
      ) : (
        <>
          <Button title={t('yesContinue')} onPress={confirm} />
          <Button title={t('editDetails')} secondary onPress={() => navigation.goBack()} />
        </>
      )}
    </Screen>
  );
}
