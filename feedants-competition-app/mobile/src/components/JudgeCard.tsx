import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { Judge } from '../types/competition';
import { colors } from '../theme';

export const JudgeCard = React.memo(function JudgeCard({ judge }: { judge: Judge }) {
  const openVideo = () => {
    if (judge.videoUrl) Linking.openURL(judge.videoUrl).catch(() => {});
  };

  return (
    <Card style={styles.card}>
      <Avatar uri={judge.avatarUrl} name={judge.name} size={54} />
      <View style={styles.info}>
        <Text style={styles.kicker}>Judge</Text>
        <Text style={styles.name}>{judge.name}</Text>
        <Text style={styles.sub}>{judge.title}</Text>
        <Text style={styles.sub}>{judge.experienceYears}+ Years of Experience</Text>
      </View>
      {judge.videoUrl && (
        <Pressable onPress={openVideo} style={styles.video} accessibilityLabel="Play judge intro video">
          <View style={styles.playCircle}><Play size={14} color={colors.primary} fill={colors.primary} /></View>
          <Text style={styles.videoText}>Intro Video</Text>
        </Pressable>
      )}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1, gap: 1 },
  kicker: { fontSize: 9, color: colors.muted },
  name: { fontSize: 14, fontWeight: '800', color: colors.text },
  sub: { fontSize: 10, color: colors.muted },
  video: { alignItems: 'center', gap: 3 },
  playCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  videoText: { fontSize: 9, color: colors.muted },
});
