import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props { label: string; variant?: 'neutral' | 'success'; icon?: React.ReactNode }

export const Badge = React.memo(function Badge({ label, variant = 'neutral', icon }: Props) {
  const success = variant === 'success';
  return (
    <View style={[styles.base, success ? styles.success : styles.neutral]}>
      {icon}
      <Text style={[styles.text, success && styles.successText]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  neutral: { backgroundColor: '#EEF2F1' },
  success: { backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.mintBorder },
  text: { fontSize: 10, fontWeight: '600', color: colors.text },
  successText: { color: colors.primary },
});
