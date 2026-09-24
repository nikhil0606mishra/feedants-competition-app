import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Award, BadgeCheck } from 'lucide-react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { SpotsProgress } from './SpotsProgress';
import { Competition } from '../types/competition';
import { colors } from '../theme';
import { titleCase } from '../utils/text';
import { formatINR } from '../utils/time';

interface Props { competition: Competition; isRegistered: boolean }

export const HeroCard = React.memo(function HeroCard({ competition: c, isRegistered }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>{c.title}</Text>
        {isRegistered && <Badge variant="success" label="Registered" icon={<BadgeCheck size={12} color={colors.primary} />} />}
      </View>

      <View style={styles.tagRow}>
        {c.categories.map((t) => <Badge key={t} label={titleCase(t)} />)}
        {c.perks.map((p) => (
          <View key={p} style={styles.perk}>
            <Award size={13} color={colors.primary} />
            <Text style={styles.perkText}>{p}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Prize Pool</Text>
          <Text style={styles.statValue}>{formatINR(c.prizePool)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Entry Fee</Text>
          <Text style={styles.statValue}>{c.entryFee === 0 ? 'Free' : formatINR(c.entryFee)}</Text>
        </View>
        <View style={styles.spots}>
          <SpotsProgress spotsFilled={c.spotsFilled} totalSpots={c.totalSpots} />
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  perkText: { fontSize: 10, fontWeight: '600', color: colors.primary },
  statsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  stat: { gap: 2 },
  statLabel: { fontSize: 10, color: colors.muted },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  spots: { flex: 1, minWidth: 110 },
});
