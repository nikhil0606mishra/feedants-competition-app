import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useSession } from '../context/SessionContext';
import { useCompetitionDetails, useRegister } from '../hooks/useCompetition';
import { useServerNow } from '../hooks/useServerNow';
import { deriveState, getActiveCountdown } from '../utils/competitionState';
import { getCtaState } from '../utils/cta';
import { colors } from '../theme';
import { Header, Language } from '../components/Header';
import { HeroCard } from '../components/HeroCard';
import { JudgeCard } from '../components/JudgeCard';
import { CountdownBar } from '../components/CountdownBar';
import { ImportantDates } from '../components/ImportantDates';
import { PreviousWinners } from '../components/PreviousWinners';
import { InfoTabs } from '../components/InfoTabs';
import { RewardsList } from '../components/RewardsList';
import { DisclaimerNote } from '../components/DisclaimerNote';
import { TrustCard } from '../components/TrustCard';
import { ReferCard } from '../components/ReferCard';
import { LinkRow } from '../components/LinkRow';
import { AdSlot } from '../components/AdSlot';
import { StickyCtaBar } from '../components/StickyCtaBar';

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionDetails'>;

const REFERRAL_REWARD = 10; // INR per signup (static for now)

export default function CompetitionDetailsScreen({ route, navigation }: Props) {
  const { competitionId } = route.params;
  const { userId } = useSession();

  const { data, isLoading, error, refetch } = useCompetitionDetails(competitionId, userId);
  const register = useRegister(competitionId, userId);
  const now = useServerNow(data?.state.serverTime);

  const [language, setLanguage] = useState<Language>('en'); // UI toggle only; translations are not wired yet
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const goBack = useCallback(() => { if (navigation.canGoBack()) navigation.goBack(); }, [navigation]);

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{error?.message ?? 'Something went wrong'}</Text>
        <Pressable onPress={() => refetch()} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable>
      </View>
    );
  }

  const { competition: c, viewer } = data;
  const derived = deriveState(c, now);
  const cta = getCtaState(c, viewer, derived);
  const active = getActiveCountdown(c, derived);

  const onCtaPress = () => {
    if (cta.kind === 'register') {
      register.mutate(undefined, { onError: (e) => Alert.alert('Could not register', e.message) });
    } else if (cta.kind === 'upload') {
      navigation.navigate('Submission', { competitionId });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onBack={goBack} language={language} onLanguageChange={setLanguage} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <HeroCard competition={c} isRegistered={!!viewer?.isRegistered} />
        <JudgeCard judge={c.judge} />
        {active && <CountdownBar label={active.label} target={active.target} now={now} showHurry={derived.registrationOpen} />}
        <ImportantDates competition={c} />
        <PreviousWinners winners={c.previousWinners} />
        <InfoTabs content={c.content} />
        <RewardsList rewards={c.rewards} />
        <DisclaimerNote text={c.disclaimer} />
        <TrustCard payoutVideoUrl={c.payoutVideoUrl} />
        <ReferCard referralUrl={`https://feedants.com/r/${userId.slice(-6)}`} reward={REFERRAL_REWARD} />
        <LinkRow
          title="Hear From Our Users"
          subtitle="See what participants say about feedants"
          onPress={() => Alert.alert('Coming soon', 'User testimonials will appear here.')}
        />
        <AdSlot />
      </ScrollView>

      <StickyCtaBar cta={cta} loading={register.isPending} onPress={onCtaPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingTop: 4, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: colors.bg },
  err: { color: '#B3261E', textAlign: 'center' },
  retry: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  retryText: { color: colors.white, fontWeight: '700' },
});
