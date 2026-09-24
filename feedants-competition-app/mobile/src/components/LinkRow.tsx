import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, MessageSquare } from 'lucide-react-native';
import { colors, radius } from '../theme';

interface Props { title: string; subtitle: string; onPress: () => void }

export const LinkRow = React.memo(function LinkRow({ title, subtitle, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <MessageSquare size={16} color={colors.text} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>
      <ChevronRight size={16} color={colors.text} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 12 },
  title: { fontSize: 11, fontWeight: '800', color: colors.text },
  sub: { fontSize: 8, color: colors.muted },
});
