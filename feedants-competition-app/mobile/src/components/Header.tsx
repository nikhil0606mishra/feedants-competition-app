import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, radius } from '../theme';

export type Language = 'en' | 'hi';

interface Props {
  onBack: () => void;
  language?: Language;
  onLanguageChange?: (l: Language) => void;
}

export const Header = React.memo(function Header({ onBack, language, onLanguageChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
        <ArrowLeft size={18} color={colors.text} />
        <Text style={styles.backText}>Go back</Text>
      </Pressable>

      {language && onLanguageChange && (
        <View style={styles.toggle}>
          <Segment label="ENG" active={language === 'en'} onPress={() => onLanguageChange('en')} />
          <Segment label="हिंदी" active={language === 'hi'} onPress={() => onLanguageChange('hi')} />
        </View>
      )}
    </View>
  );
});

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.seg, active && styles.segActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 14, fontWeight: '700', color: colors.text },
  toggle: { flexDirection: 'row', backgroundColor: '#E9EEED', borderRadius: radius.pill, padding: 2 },
  seg: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  segActive: { backgroundColor: colors.primary },
  segText: { fontSize: 10, fontWeight: '700', color: colors.muted },
  segTextActive: { color: colors.white },
});
