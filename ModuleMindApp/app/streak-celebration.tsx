import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';
import { useLanguage } from '../hooks/use-language';

type QuizScore = {
  completedAt: string;
};

type StoredUser = {
  id?: number;
  user_id?: number;
  name?: string;
  full_name?: string;
  email?: string;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const asParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default function StreakCelebrationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const streak = Number(asParam(params.streak) || 1);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const userData = await AsyncStorage.getItem('user');
        const storedUser = userData ? JSON.parse(userData) : null;
        setUser(storedUser);

        const userId = storedUser?.id || storedUser?.user_id || 'guest';
        const storedScores = await AsyncStorage.getItem(`quizScores:${userId}`);
        const scores: QuizScore[] = storedScores ? JSON.parse(storedScores) : [];
        setCompletedDays(new Set(scores.map((score) => dateKey(startOfDay(new Date(score.completedAt))))));
      };

      load();
    }, [])
  );

  const firstName = (user?.name || user?.full_name || user?.email || 'Student').split(' ')[0];
  const greeting = language === 'nl' ? `Goedemorgen, ${firstName}` : `Good morning, ${firstName}`;

  const weekDays = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(today, index - 6);
      return {
        key: dateKey(date),
        label: date.toLocaleDateString(language === 'nl' ? 'nl-BE' : language, { weekday: 'short' }).slice(0, 1).toUpperCase(),
        completed: completedDays.has(dateKey(date)),
      };
    });
  }, [completedDays, language]);

  const shareStreak = async () => {
    await Share.share({ message: `${streak} ${t('dayStreak')} met ModuleMind!` });
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF', '#F2FFD7']} locations={[0, 0.78, 1]} style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.greeting}>{greeting}</Text>

          <View style={styles.flameWrap}>
            <View style={styles.flameGlow} />
            <Ionicons name="flame" size={118} color="#05C925" />
          </View>

          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <View key={day.key} style={styles.dayItem}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <View style={[styles.dayCircle, day.completed && styles.dayCircleDone]}>
                  <Ionicons name="checkmark" size={18} color={day.completed ? '#05C925' : '#777'} />
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.streakTitle}>{streak} {t('dayStreak')}!</Text>
          <Text style={styles.streakSubtitle}>{t('keepGoing')}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareButton} activeOpacity={0.85} onPress={shareStreak}>
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.continueButton} activeOpacity={0.85} onPress={() => router.replace('/(tabs)/Home')}>
              <Text style={styles.continueText}>{t('continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <CustomTabBar activeTab="Home" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 64, paddingBottom: 130, alignItems: 'center' },
  greeting: { alignSelf: 'flex-start', color: '#05C925', fontSize: 22, fontWeight: '900' },
  flameWrap: { marginTop: 58, width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  flameGlow: { position: 'absolute', width: 132, height: 132, borderRadius: 66, backgroundColor: '#05C925', opacity: 0.16, shadowColor: '#05C925', shadowOpacity: 0.9, shadowRadius: 28, shadowOffset: { width: 0, height: 0 } },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 36 },
  dayItem: { alignItems: 'center', gap: 6 },
  dayLabel: { color: '#666', fontSize: 13, fontWeight: '800' },
  dayCircle: { width: 27, height: 27, borderRadius: 14, borderWidth: 2, borderColor: '#777', alignItems: 'center', justifyContent: 'center' },
  dayCircleDone: { borderColor: '#05C925' },
  streakTitle: { marginTop: 26, color: '#444', fontSize: 23, fontWeight: '900' },
  streakSubtitle: { marginTop: 9, color: '#777', fontSize: 14, fontWeight: '800' },
  actionRow: { marginTop: 'auto', flexDirection: 'row', alignSelf: 'flex-end', gap: 10 },
  shareButton: { width: 34, height: 34, borderRadius: 5, backgroundColor: '#05C925', alignItems: 'center', justifyContent: 'center' },
  continueButton: { minWidth: 102, height: 34, borderRadius: 5, backgroundColor: '#05C925', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  continueText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
});
