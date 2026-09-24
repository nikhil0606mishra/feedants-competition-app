import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Card } from './Card';
import { Competition } from '../types/competition';
import { colors, radius } from '../theme';

type TabKey = 'about' | 'judging' | 'rules';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'about', label: 'About Competition' },
  { key: 'judging', label: 'Judging Parameters' },
  { key: 'rules', label: 'Rules & Eligibility' },
];

// Collapsed previews: text -> 3 lines, lists -> first N rows.
const TEXT_LINES = 3;
const LIST_ROWS = 4;

type Row = { kind: 'heading' | 'bullet'; text: string; extra?: string };

function buildRows(tab: TabKey, content: Competition['content']): Row[] {
  if (tab === 'judging') {
    return content.judgingParameters.map((p) => ({
      kind: 'bullet', text: `${p.title} (${p.weightage}%)`, extra: p.description,
    }));
  }
  const rows: Row[] = [];
  if (content.rules.length) rows.push({ kind: 'heading', text: 'Rules' }, ...content.rules.map((t) => ({ kind: 'bullet' as const, text: t })));
  if (content.eligibility.length) rows.push({ kind: 'heading', text: 'Eligibility' }, ...content.eligibility.map((t) => ({ kind: 'bullet' as const, text: t })));
  return rows;
}

export const InfoTabs = React.memo(function InfoTabs({ content }: { content: Competition['content'] }) {
  const [tab, setTab] = useState<TabKey>('about');
  const [expanded, setExpanded] = useState(false);

  const selectTab = (k: TabKey) => { setTab(k); setExpanded(false); };

  const rows = tab === 'about' ? [] : buildRows(tab, content);
  const isText = tab === 'about';
  const canExpand = isText ? content.about.length > 150 : rows.length > LIST_ROWS;
  const visibleRows = expanded ? rows : rows.slice(0, LIST_ROWS);

  return (
    <Card style={styles.card}>
      <View style={styles.tabRow}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable key={t.key} onPress={() => selectTab(t.key)} style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.body}>
        {isText ? (
          <Text style={styles.text} numberOfLines={expanded ? undefined : TEXT_LINES}>{content.about}</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.text}>Nothing to show yet.</Text>
        ) : (
          visibleRows.map((r, i) =>
            r.kind === 'heading' ? (
              <Text key={i} style={styles.heading}>{r.text}</Text>
            ) : (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.dot}>•</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.text}>{r.text}</Text>
                  {r.extra && <Text style={styles.extra}>{r.extra}</Text>}
                </View>
              </View>
            )
          )
        )}

        {canExpand && (
          <Pressable onPress={() => setExpanded((e) => !e)} style={styles.more} hitSlop={8}>
            <Text style={styles.moreText}>{expanded ? 'View less' : 'View more'}</Text>
            {expanded ? <ChevronUp size={14} color={colors.primary} /> : <ChevronDown size={14} color={colors.primary} />}
          </Pressable>
        )}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 10, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.primary, fontWeight: '800' },
  body: { padding: 12, gap: 6 },
  text: { fontSize: 10, lineHeight: 15, color: colors.text },
  extra: { fontSize: 10, lineHeight: 14, color: colors.muted },
  heading: { fontSize: 11, fontWeight: '800', color: colors.text, marginTop: 2 },
  bulletRow: { flexDirection: 'row', gap: 6 },
  dot: { fontSize: 10, color: colors.primary },
  more: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  moreText: { fontSize: 11, fontWeight: '700', color: colors.primary },
});
