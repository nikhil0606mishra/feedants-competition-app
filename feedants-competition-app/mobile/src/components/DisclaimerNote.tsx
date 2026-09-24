import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Info } from 'lucide-react-native';
import { colors, radius } from '../theme';

export const DisclaimerNote = React.memo(function DisclaimerNote({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <View style={styles.box}>
      <Info size={14} color={colors.primary} />
      <Text style={styles.text}><Text style={styles.bold}>Disclaimer: </Text>{text}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.mintBorder, borderRadius: radius.md, padding: 10 },
  text: { flex: 1, fontSize: 10, color: colors.text },
  bold: { fontWeight: '800' },
});
