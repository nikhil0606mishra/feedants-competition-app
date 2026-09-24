import React from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { PreviousWinner } from '../types/competition';
import { colors, radius } from '../theme';

export const PreviousWinners = React.memo(function PreviousWinners({ winners }: { winners: PreviousWinner[] }) {
  if (winners.length === 0) return null;
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Previous Winners</Text>
      <FlatList
        horizontal
        data={winners}
        keyExtractor={(w, i) => `${w.name}-${i}`}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            disabled={!item.videoUrl}
            onPress={() => item.videoUrl && Linking.openURL(item.videoUrl).catch(() => {})}
          >
            <View>
              <Avatar uri={item.avatarUrl} name={item.name} size={40} />
              {item.videoUrl && (
                <View style={styles.playBadge}><Play size={8} color={colors.white} fill={colors.white} /></View>
              )}
            </View>
            <View>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.rank}>{item.rankLabel}</Text>
            </View>
          </Pressable>
        )}
      />
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { gap: 8 },
  title: { fontSize: 12, fontWeight: '800', color: colors.text },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F4F7F6', borderRadius: radius.md, padding: 6, paddingRight: 12 },
  playBadge: { position: 'absolute', right: -2, bottom: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  name: { maxWidth: 80, fontSize: 10, fontWeight: '700', color: colors.text },
  rank: { fontSize: 9, color: colors.muted },
});
