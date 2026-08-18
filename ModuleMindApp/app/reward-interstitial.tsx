import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, SafeAreaView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';
import { getLevelStats } from '../constants/progress';
import { useLanguage } from '../hooks/use-language';

const asNumber = (value: string | string[] | undefined, fallback = 0) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asString = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default function RewardInterstitialScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();
  const previousXp = asNumber(params.previousXp);
  const nextXp = asNumber(params.nextXp);
  const gainedXp = asNumber(params.gainedXp, Math.max(0, nextXp - previousXp));
  const previousLevel = asNumber(params.previousLevel, getLevelStats(previousXp).level);
  const nextLevel = asNumber(params.nextLevel, getLevelStats(nextXp).level);
  const showStreak = asString(params.showStreak) === 'true';
  const streak = asNumber(params.streak, 1);
  const leveledUp = nextLevel > previousLevel;
  const previousStats = useMemo(() => getLevelStats(previousXp), [previousXp]);
  const nextStats = useMemo(() => getLevelStats(nextXp), [nextXp]);
  const animatedProgress = useRef(new Animated.Value(leveledUp ? 0 : previousStats.progress)).current;
  const badgeScale = useRef(new Animated.Value(0.86)).current;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    animatedProgress.setValue(leveledUp ? 0 : previousStats.progress);
    Animated.parallel([
      Animated.timing(animatedProgress, {
        toValue: nextStats.progress,
        duration: leveledUp ? 1300 : 1000,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(badgeScale, { toValue: 1.08, duration: 260, useNativeDriver: true }),
        Animated.spring(badgeScale, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
      ]),
    ]).start();
  }, [animatedProgress, badgeScale, leveledUp, nextStats.progress, previousStats.progress]);

  const animatedWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [0, barWidth],
  });

  const handleContinue = () => {
    if (showStreak) {
      router.replace({ pathname: '/streak-celebration', params: { streak } });
      return;
    }

    router.replace('/scores');
  };

  const shareReward = async () => {
    await Share.share({ message: `${t('level')} ${nextLevel} - ${nextXp} XP met ModuleMind!` });
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF', '#F2FFD7']} locations={[0, 0.78, 1]} style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>{leveledUp ? t('levelUpTitle') : t('xpRewardTitle')}</Text>

          <Animated.View style={[styles.rewardIcon, leveledUp && styles.levelUpIcon, { transform: [{ scale: badgeScale }] }]}>
            <Ionicons name={leveledUp ? 'sparkles-outline' : 'flash-outline'} size={64} color="#05C925" />
          </Animated.View>

          <Text style={styles.title}>{leveledUp ? `${t('level')} ${nextLevel}!` : `+${gainedXp} XP`}</Text>
          <Text style={styles.subtitle}>{leveledUp ? t('levelUpSubtitle') : t('xpRewardSubtitle')}</Text>

          <View style={styles.levelCard}>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>{t('level')} {nextLevel}</Text>
              <Text style={styles.xpLabel}>{nextXp} XP</Text>
            </View>
            <View style={styles.track} onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}>
              <Animated.View style={[styles.fill, { width: animatedWidth }]} />
            </View>
            <Text style={styles.meta}>{nextStats.xpToNextLevel} {t('xpToNextLevel')}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>+{gainedXp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{previousLevel} &gt; {nextLevel}</Text>
              <Text style={styles.statLabel}>{t('level')}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareButton} activeOpacity={0.85} onPress={shareReward}>
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.continueButton} activeOpacity={0.85} onPress={handleContinue}>
              <Text style={styles.continueText}>{t('continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <CustomTabBar activeTab="Modules" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 26, paddingTop: 60, paddingBottom: 132, alignItems: 'center' },
  eyebrow: { alignSelf: 'flex-start', color: '#05C925', fontSize: 22, fontWeight: '900' },
  rewardIcon: { marginTop: 58, width: 132, height: 132, borderRadius: 66, backgroundColor: '#E9FBEF', alignItems: 'center', justifyContent: 'center', shadowColor: '#05C925', shadowOpacity: 0.28, shadowRadius: 28, shadowOffset: { width: 0, height: 0 } },
  levelUpIcon: { backgroundColor: '#F2FFD7', borderWidth: 2, borderColor: '#05C925' },
  title: { marginTop: 28, color: '#333333', fontSize: 30, fontWeight: '900' },
  subtitle: { marginTop: 8, color: '#666666', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  levelCard: { width: '100%', marginTop: 30, borderRadius: 10, borderWidth: 1, borderColor: '#D8F8E2', backgroundColor: '#FFFFFF', padding: 15 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelLabel: { color: '#05C925', fontSize: 18, fontWeight: '900' },
  xpLabel: { color: '#333333', fontSize: 13, fontWeight: '900' },
  track: { marginTop: 12, height: 18, borderRadius: 999, backgroundColor: '#E5E5E5', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: '#05C925' },
  meta: { marginTop: 8, color: '#666666', fontSize: 12, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 14 },
  statBox: { flex: 1, borderRadius: 8, backgroundColor: '#F7FFF9', borderWidth: 1, borderColor: '#D8F8E2', paddingVertical: 12, alignItems: 'center' },
  statValue: { color: '#333333', fontSize: 18, fontWeight: '900' },
  statLabel: { marginTop: 3, color: '#777777', fontSize: 11, fontWeight: '800' },
  actionRow: { marginTop: 'auto', flexDirection: 'row', alignSelf: 'flex-end', gap: 10 },
  shareButton: { width: 38, height: 38, borderRadius: 6, backgroundColor: '#05C925', alignItems: 'center', justifyContent: 'center' },
  continueButton: { minWidth: 112, height: 38, borderRadius: 6, backgroundColor: '#05C925', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  continueText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
});

