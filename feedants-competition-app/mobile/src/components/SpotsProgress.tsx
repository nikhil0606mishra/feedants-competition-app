import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Users } from 'lucide-react-native';
import { colors, radius } from '../theme';

interface Props { spotsFilled: number; totalSpots: number }

export const SpotsProgress = React.memo(function SpotsProgress({ spotsFilled, totalSpots }: Props) {
  const remaining = Math.max(totalSpots - spotsFilled, 0);
  const pct = Math.min((spotsFilled / totalSpots) * 100, 100);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Users size={14} color={colors.primary} />
        <Text style={styles.label}>{remaining === 0 ? 'All spots booked' : `Only ${remaining} spots left`}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.caption}>{spotsFilled}/{totalSpots} Booked</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { fontSize: 11, fontWeight: '700', color: colors.primary },
  track: { height: 4, borderRadius: radius.pill, backgroundColor: '#E1E8E7', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  caption: { fontSize: 10, color: colors.muted },
});
