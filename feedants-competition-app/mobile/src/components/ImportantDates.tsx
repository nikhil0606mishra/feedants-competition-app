import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Send, Trophy, Upload } from 'lucide-react-native';
import { Card } from './Card';
import { Competition } from '../types/competition';
import { colors, radius } from '../theme';
import { formatDateShort, formatTime } from '../utils/time';

export const ImportantDates = React.memo(function ImportantDates({ competition: c }: { competition: Competition }) {
  const items = [
    { label: 'Register Before', iso: c.registrationDeadline, Icon: CalendarDays },
    { label: 'Submission Starts', iso: c.submissionStart, Icon: Send },
    { label: 'Submission Ends', iso: c.submissionEnd, Icon: Upload },
    { label: 'Result Date', iso: c.resultDate, Icon: Trophy },
  ];

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Important Dates</Text>
      <View style={styles.grid}>
        {items.map(({ label, iso, Icon }, i) => (
          <View key={label} style={[styles.cell, i % 2 === 0 && styles.cellRight, i < 2 && styles.cellBottom]}>
            <View style={styles.iconBox}><Icon size={14} color={colors.primary} /></View>
            <View>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.date}>{formatDateShort(iso)}</Text>
              <Text style={styles.time}>{formatTime(iso)}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { gap: 8 },
  title: { fontSize: 12, fontWeight: '800', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  cell: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  cellRight: { borderRightWidth: 1, borderRightColor: colors.border },
  cellBottom: { borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBox: { width: 26, height: 26, borderRadius: 6, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 9, color: colors.muted },
  date: { fontSize: 11, fontWeight: '800', color: colors.text },
  time: { fontSize: 10, fontWeight: '600', color: colors.text },
});
