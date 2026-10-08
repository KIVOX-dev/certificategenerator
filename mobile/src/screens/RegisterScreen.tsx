import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ApiError, errorKey, getEvent, PublicEvent } from '../api';
import { Banner, Button, Field, Heading, Lead, Loading, Screen } from '../components/ui';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation';
import { cleanName, FormErrors, validateForm } from '../validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ route, navigation }: Props) {
  const { eventCode } = route.params;
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    getEvent(eventCode)
      .then(setEvent)
      .catch((e) => setFatal(e instanceof ApiError && e.code === 'EVENT_NOT_FOUND' ? 'error.EVENT_NOT_FOUND' : errorKey(e)));
  }, [eventCode]);

  if (fatal) {
    return (
      <Screen>
        <Heading>{t('getCertificate')}</Heading>
        <Banner kind="bad">{t(fatal)}</Banner>
      </Screen>
    );
  }
  if (!event) {
    return (
      <Screen>
        <Loading text={t('loading')} />
      </Screen>
    );
  }
  if (!event.open) {
    return (
      <Screen>
        <Heading>{t('registrationClosed')}</Heading>
        <Banner kind="warn">{t('registrationClosedText')}</Banner>
      </Screen>
    );
  }

  function next() {
    const found = validateForm(fullName, phone);
    setErrors(found);
    if (Object.keys(found).length === 0) navigation.navigate('Confirm', { eventCode, fullName: cleanName(fullName), phone });
  }

  return (
    <Screen>
      <Heading>{t('getCertificate')}</Heading>
      <Lead>{event.name}</Lead>
      <Lead>{t('enterDetails')}</Lead>
      <Field
        label={t('fullName')}
        value={fullName}
        onChangeText={setFullName}
        autoComplete="name"
        autoCapitalize="words"
        placeholder={t('fullNamePlaceholder')}
        error={errors.fullName && t(`error.${errors.fullName}`)}
      />
      <Field
        label={t('phoneNumber')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder={t('phonePlaceholder')}
        error={errors.phone && t(`error.${errors.phone}`)}
      />
      <Button title={t('continue')} onPress={next} />
    </Screen>
  );
}
