import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Medal, Star, Trophy } from 'lucide-react-native';
import { Card } from './Card';
import { Reward } from '../types/competition';
import { colors } from '../theme';
import { formatINR } from '../utils/time';

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={15} color={colors.gold} />;
  if (rank === 2) return <Medal size={15} color={colors.silver} />;
  if (rank === 3) return <Medal size={15} color={colors.bronze} />;
  return <Star size={15} color={colors.primary} />;
}

export const RewardsList = React.memo(function RewardsList({ rewards }: { rewards: Reward[] }) {
  if (rewards.length === 0) return null;
  const sorted = [...rewards].sort((a, b) => a.rank - b.rank);
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Rewards <Text style={styles.sub}>(All Positions)</Text></Text>
      {sorted.map((r) => (
        <View key={r.rank} style={styles.row}>
          <RankIcon rank={r.rank} />
          <Text style={styles.label}>{r.label}</Text>
          <Text style={styles.amount}>{formatINR(r.amount)}</Text>
        </View>
      ))}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { gap: 9 },
  title: { fontSize: 12, fontWeight: '800', color: colors.text },
  sub: { fontSize: 9, fontWeight: '400', color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { flex: 1, fontSize: 11, fontWeight: '600', color: colors.text },
  amount: { fontSize: 11, fontWeight: '800', color: colors.text },
});
