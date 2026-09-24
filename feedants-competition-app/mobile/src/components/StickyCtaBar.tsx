import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cta } from '../utils/cta';
import { colors, radius } from '../theme';

interface Props { cta: Cta; loading?: boolean; onPress: () => void }

export function StickyCtaBar({ cta, loading, onPress }: Props) {
  const insets = useSafeAreaInsets();
  const disabled = cta.disabled || loading;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        style={({ pressed }) => [styles.btn, disabled && styles.btnDisabled, pressed && !disabled && { opacity: 0.85 }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Text style={styles.label}>{cta.label}</Text>
            {cta.subLabel && <Text style={styles.sub}>{cta.subLabel}</Text>}
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 10 },
  btn: { minHeight: 46, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  btnDisabled: { backgroundColor: colors.primaryDisabled },
  label: { color: colors.white, fontSize: 14, fontWeight: '800' },
  sub: { color: colors.white, fontSize: 9, opacity: 0.9 },
});
