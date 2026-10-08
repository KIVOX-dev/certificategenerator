import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, font } from '../theme';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>{children}</View>
    </ScrollView>
  );
}

export const Heading = ({ children }: { children: ReactNode }) => (
  <Text accessibilityRole="header" style={styles.heading}>
    {children}
  </Text>
);
export const Lead = ({ children }: { children: ReactNode }) => <Text style={styles.lead}>{children}</Text>;

export function Button({
  title,
  onPress,
  secondary,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.navy : '#fff'} />
      ) : (
        <Text style={[styles.buttonText, secondary && { color: colors.navy }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, error, ...props }: { label: string; error?: string } & TextInputProps) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#64748b"
        style={[styles.input, !!error && { borderColor: colors.bad, backgroundColor: colors.badBg }]}
        {...props}
      />
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

export function Banner({ kind, children }: { kind: 'ok' | 'bad' | 'warn'; children: ReactNode }) {
  const [bg, fg] = { ok: [colors.okBg, colors.ok], bad: [colors.badBg, colors.bad], warn: [colors.warnBg, colors.warn] }[kind];
  return (
    <View accessibilityLiveRegion="polite" style={[styles.banner, { backgroundColor: bg }]}>
      <Text style={[styles.bannerText, { color: fg }]}>{children}</Text>
    </View>
  );
}

export const Loading = ({ text }: { text: string }) => (
  <View style={{ padding: 32, alignItems: 'center' }} accessibilityLiveRegion="polite">
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={[styles.lead, { marginTop: 12 }]}>{text}</Text>
  </View>
);

export const BigName = ({ children }: { children: ReactNode }) => <Text style={styles.bigName}>{String(children).toUpperCase()}</Text>;

const styles = StyleSheet.create({
  screen: { padding: 16, flexGrow: 1 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  heading: { fontSize: font.heading, fontWeight: '800', color: colors.navy, marginBottom: 12 },
  lead: { fontSize: font.lead, color: colors.muted, marginBottom: 16 },
  label: { fontSize: 19, fontWeight: '700', color: colors.text, marginBottom: 8 },
  input: {
    minHeight: 60,
    borderRadius: 16,
    backgroundColor: colors.field,
    paddingHorizontal: 18,
    fontSize: 20,
    color: colors.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  error: { color: colors.bad, fontSize: font.body, fontWeight: '600', marginTop: 8 },
  button: { minHeight: 62, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 14 },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: '#e4f1f3' },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  banner: { padding: 16, borderRadius: 16, marginBottom: 18 },
  bannerText: { fontSize: font.body, fontWeight: '600' },
  bigName: { fontSize: font.big, fontWeight: '800', color: colors.navy, backgroundColor: colors.field, borderRadius: 16, padding: 16, marginBottom: 16 },
});
