import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Megaphone } from 'lucide-react-native';
import { colors, radius } from '../theme';
import { formatINR } from '../utils/time';

interface Props { referralUrl: string; reward: number }

export const ReferCard = React.memo(function ReferCard({ referralUrl, reward }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const share = () => Share.share({ message: `Join me on Feedants and win prizes! ${referralUrl}` }).catch(() => {});

  return (
    <View style={styles.box}>
      <Megaphone size={22} color={colors.primary} />
      <View style={styles.middle}>
        <Text style={styles.title}>Refer & Earn more discount</Text>
        <View style={styles.linkRow}>
          <Text style={styles.link} numberOfLines={1}>{referralUrl}</Text>
          <Pressable onPress={copy} style={styles.copyBtn}>
            <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy link'}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.right}>
        <Pressable onPress={share} style={styles.referBtn}><Text style={styles.referText}>Refer Now</Text></Pressable>
        <Text style={styles.earn}>You earn {formatINR(reward)} for every signup</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.mintBorder, borderRadius: radius.lg, padding: 10 },
  middle: { flex: 1.4, gap: 5 },
  title: { fontSize: 10, fontWeight: '800', color: colors.text },
  linkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.mintBorder, paddingLeft: 6 },
  link: { flex: 1, fontSize: 8, color: colors.muted },
  copyBtn: { paddingHorizontal: 8, paddingVertical: 5, borderLeftWidth: 1, borderLeftColor: colors.mintBorder },
  copyText: { fontSize: 8, fontWeight: '700', color: colors.text },
  right: { flex: 1, alignItems: 'center', gap: 4 },
  referBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 8, alignSelf: 'stretch', alignItems: 'center' },
  referText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  earn: { fontSize: 7, color: colors.muted, textAlign: 'center' },
});
