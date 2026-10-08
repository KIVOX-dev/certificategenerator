import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { ApiError, errorKey, formatDate, getCertificate, pdfUrl, previewUrl, PublicCertificate } from '../api';
import { Banner, BigName, Button, Heading, Lead, Loading, Screen } from '../components/ui';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Certificate'>;

export default function CertificateScreen({ route }: Props) {
  const { ref, isNew } = route.params;
  const [cert, setCert] = useState<PublicCertificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [ratio, setRatio] = useState(1.34);

  useEffect(() => {
    getCertificate(ref)
      .then((c) => {
        setCert(c);
        Image.getSize(previewUrl(c.certificateId), (w, h) => setRatio(w / h), () => undefined);
      })
      .catch((e) => (e instanceof ApiError && e.code === 'CERTIFICATE_NOT_FOUND' ? setNotFound(true) : setError(errorKey(e))));
  }, [ref]);

  async function download() {
    if (!cert) return;
    setState('busy');
    try {
      const file = await File.downloadFileAsync(pdfUrl(cert.certificateId), new File(Paths.cache, `Certificate-${cert.certificateNumber}.pdf`), {
        idempotent: true,
      });
      setState('done');
      // The share sheet lets the person open the PDF, save it to Files/Drive or send it on WhatsApp.
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: cert.eventName ?? t('certificateTitle'), UTI: 'com.adobe.pdf' });
      }
    } catch {
      setState('error');
    }
  }

  if (notFound) {
    return (
      <Screen>
        <Heading>{t('certificateNotFound')}</Heading>
        <Banner kind="bad">{t('certificateNotFoundText')}</Banner>
        <Lead>{t('certificateNotFoundHint')}</Lead>
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen>
        <Banner kind="bad">{t(error)}</Banner>
      </Screen>
    );
  }
  if (!cert) {
    return (
      <Screen>
        <Loading text={t('loading')} />
      </Screen>
    );
  }
  if (cert.status === 'REVOKED') {
    return (
      <Screen>
        <Heading>{t('certificateRevoked')}</Heading>
        <Banner kind="bad">✗ {t('certificateRevokedText')}</Banner>
        <Lead>
          {t('certificateNumber')}: {cert.certificateNumber}
        </Lead>
      </Screen>
    );
  }

  const expired = cert.status === 'EXPIRED';
  const details: [string, string | null][] = [
    [t('certificateNumber'), cert.certificateNumber],
    [t('course'), cert.eventName],
    [t('issued'), formatDate(cert.issueDate)],
    [t('organization'), cert.organizationName],
  ];

  return (
    <Screen>
      {isNew && !expired ? (
        <>
          <Heading>✓ {t('certificateReady')}</Heading>
          <Lead>{t('issuedTo')}</Lead>
        </>
      ) : (
        <>
          <Heading>{t('certificateTitle')}</Heading>
          <Banner kind={expired ? 'bad' : 'ok'}>
            {expired ? `✗ ${t('certificateExpired')}. ${t('certificateExpiredText')}` : `✓ ${t('validCertificate').toUpperCase()}`}
          </Banner>
        </>
      )}
      <BigName>{cert.recipientName ?? ''}</BigName>

      {!expired && (
        <>
          <Image
            accessibilityLabel={t('certificatePreviewAlt')}
            source={{ uri: previewUrl(cert.certificateId) }}
            style={{ width: '100%', aspectRatio: ratio, borderRadius: 10 }}
            resizeMode="contain"
          />
          {state === 'busy' && <Banner kind="warn">{t('preparingDownload')}</Banner>}
          {state === 'done' && <Banner kind="ok">{t('downloadReady')}</Banner>}
          {state === 'error' && <Banner kind="bad">{t('error.download')}</Banner>}
          <Button title={t('downloadCertificate')} onPress={download} loading={state === 'busy'} />
        </>
      )}

      <View style={{ backgroundColor: colors.field, borderRadius: 16, padding: 16, marginTop: 18 }}>
        {details.map(([label, value]) => (
          <View key={label} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 15, color: colors.muted }}>{label.toUpperCase()}</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{value}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
