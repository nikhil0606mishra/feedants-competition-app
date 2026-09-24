import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

// Falls back to initials when there is no image or it fails to load.
export function Avatar({ uri, name, size = 48 }: { uri?: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size, borderRadius: size / 2 };

  if (!uri || failed) {
    const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    return (
      <View style={[box, styles.fallback]}>
        <Text style={[styles.initials, { fontSize: size / 3 }]}>{initials}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={box} onError={() => setFailed(true)} />;
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.primary, fontWeight: '700' },
});
