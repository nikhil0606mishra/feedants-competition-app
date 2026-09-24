import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Megaphone } from 'lucide-react-native';
import { colors, radius } from '../theme';

// Placeholder for a future ad unit (AdMob etc.). Fixed height avoids layout shift when it loads.
export const AdSlot = React.memo(function AdSlot() {
  return (
    <View style={styles.box}>
      <Megaphone size={14} color={colors.muted} />
      <Text style={styles.text}>Ad Here</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  box: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.md },
  text: { fontSize: 10, color: colors.muted },
});
