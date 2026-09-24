import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Hourglass, Timer } from 'lucide-react-native';
import { colors, radius } from '../theme';
import { getCountdown, pad2 } from '../utils/time';

interface Props { label: string; target: string; now: Date; showHurry?: boolean }

// Not memoised on purpose: `now` changes every second, this is the one thing that SHOULD re-render.
export function CountdownBar({ label, target, now, showHurry }: Props) {
  const t = getCountdown(target, now);
  return (
    <View style={styles.bar}>
      <Hourglass size={16} color={colors.primary} />
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Text style={styles.time} accessibilityLiveRegion="none">
        {pad2(t.days)}d : {pad2(t.hours)}h : {pad2(t.minutes)}m : {pad2(t.seconds)}s
      </Text>
      {showHurry && (
        <View style={styles.hurry}>
          <Timer size={14} color={colors.primary} />
          <Text style={styles.hurryText}>Hurry up!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.mintBorder,
    borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 8,
  },
  label: { flexShrink: 1, fontSize: 10, color: colors.text },
  time: { flex: 1, fontSize: 12, fontWeight: '800', color: colors.primary, fontVariant: ['tabular-nums'] }, // tabular digits: no jitter each second
  hurry: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hurryText: { fontSize: 10, fontWeight: '700', color: colors.primary },
});
