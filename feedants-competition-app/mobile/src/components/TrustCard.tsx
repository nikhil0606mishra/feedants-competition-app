import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Play, ShieldCheck } from 'lucide-react-native';
import { Card } from './Card';
import { colors } from '../theme';

export const TrustCard = React.memo(function TrustCard({ payoutVideoUrl }: { payoutVideoUrl?: string }) {
  return (
    <Card style={styles.card}>
      <Pressable
        style={styles.left}
        disabled={!payoutVideoUrl}
        onPress={() => payoutVideoUrl && Linking.openURL(payoutVideoUrl).catch(() => {})}
      >
        <View style={styles.play}><Play size={14} color={colors.white} fill={colors.white} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>How will you receive prize money?</Text>
          <Text style={styles.sub}>Watch video to know more</Text>
        </View>
      </Pressable>
      <View style={styles.right}>
        <View style={styles.policy}><ShieldCheck size={14} color={colors.text} /><Text style={styles.policyText}>Refund policy</Text></View>
        <View style={styles.policy}><ShieldCheck size={14} color={colors.text} /><Text style={styles.policyText}>Secure payments powered by Razorpay</Text></View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 10 },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  play: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 10, fontWeight: '800', color: colors.text },
  sub: { fontSize: 9, color: colors.muted },
  right: { flex: 1, gap: 8, justifyContent: 'center' },
  policy: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  policyText: { flexShrink: 1, fontSize: 9, color: colors.text },
});
