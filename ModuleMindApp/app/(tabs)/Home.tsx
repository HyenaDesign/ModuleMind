import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import CustomTabBar from '../../components/CustomTabBar';
import AppMessage from '../../components/AppMessage';
import { useLanguage } from '../../hooks/use-language';

interface Subject {
  id: number;
  title: string;
  description: string | null;
  user_id: number;
  created_at?: string;
  cover_image?: string | null;
  icon?: string | null;
}

type QuizScore = {
  id: string;
  userId: string;
  subjectTitle: string;
  moduleTitle: string;
  correct: number;
  total: number;
  percentage: number;
  completedAt: string;
  durationSeconds?: number;
};

type UserSummary = {
  id?: number;
  user_id?: number;
  name?: string;
  full_name?: string;
  email?: string;
};

const WEEKLY_MODULE_GOAL = 5;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const getStreak = (scores: QuizScore[]) => {
  const completedDays = new Set(scores.map((score) => dateKey(startOfDay(new Date(score.completedAt)))));
  if (completedDays.size === 0) return 0;

  const today = startOfDay(new Date());
  let cursor = completedDays.has(dateKey(today)) ? today : addDays(today, -1);
  let streak = 0;

  while (completedDays.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

export default function WhiteHeaderPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    let localSubjects: Subject[] = [];

    try {
      setLoading(true);
      setMessage(null);
      const userData = await AsyncStorage.getItem('user');

      if (!userData) {
        setSubjects([]);
        router.replace('/signin');
        return;
      }

      const storedUser = JSON.parse(userData);
      const userId = storedUser.id || storedUser.user_id;
      setUser(storedUser);

      if (!userId) {
        setSubjects([]);
        router.replace('/signin');
        return;
      }

      const storedScores = await AsyncStorage.getItem(`quizScores:${userId}`);
      setScores(storedScores ? JSON.parse(storedScores) : []);
      const storedSubjects = await AsyncStorage.getItem(`localSubjects:${userId}`);
      localSubjects = storedSubjects ? JSON.parse(storedSubjects) : [];

      const response = await fetch(`https://modulemindapi-production.up.railway.app/subjects/${userId}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const mergedSubjects = [...localSubjects];
        data.forEach((subject: Subject) => {
          const index = mergedSubjects.findIndex((item) => item.id === subject.id);
          if (index >= 0) {
            mergedSubjects[index] = { ...mergedSubjects[index], ...subject };
          } else {
            mergedSubjects.push(subject);
          }
        });
        const subjectsWithLocalCovers = await Promise.all(mergedSubjects.map(async (subject: Subject) => ({
          ...subject,
          cover_image: subject.cover_image || subject.icon || await AsyncStorage.getItem(`subjectCover:${subject.id}`),
        })));
        setSubjects(subjectsWithLocalCovers);
      } else {
        setMessage(data.message || t('somethingWentWrong'));
        setSubjects(localSubjects);
      }
    } catch {
      setMessage(t('noInternet'));
      setSubjects(localSubjects);
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [fetchSubjects])
  );

  const learningAnalysis = useMemo(() => {
    const now = new Date();
    const currentWeekStart = addDays(startOfDay(now), -6);
    const previousWeekStart = addDays(currentWeekStart, -7);
    const currentWeekScores = scores.filter((score) => new Date(score.completedAt) >= currentWeekStart);
    const previousWeekScores = scores.filter((score) => {
      const completedAt = new Date(score.completedAt);
      return completedAt >= previousWeekStart && completedAt < currentWeekStart;
    });
    const currentCorrect = currentWeekScores.reduce((sum, score) => sum + score.correct, 0);
    const previousCorrect = previousWeekScores.reduce((sum, score) => sum + score.correct, 0);
    const improvement = previousCorrect === 0
      ? currentCorrect
      : Math.round(((currentCorrect - previousCorrect) / Math.max(previousCorrect, 1)) * 100);
    const subjectStats = new Map<string, { correct: number; total: number }>();

    scores.forEach((score) => {
      const title = score.subjectTitle || t('subject');
      const current = subjectStats.get(title) || { correct: 0, total: 0 };
      current.correct += score.correct;
      current.total += score.total;
      subjectStats.set(title, current);
    });

    const rankedSubjects = Array.from(subjectStats.entries())
      .map(([title, stats]) => ({
        title,
        percentage: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      streak: getStreak(scores),
      weeklyCompleted: currentWeekScores.length,
      weeklyProgress: clampPercent((currentWeekScores.length / WEEKLY_MODULE_GOAL) * 100),
      improvement,
      improvedQuestions: Math.max(0, currentCorrect - previousCorrect),
      learnedMinutes: Math.round(currentWeekScores.reduce((sum, score) => sum + (score.durationSeconds || 0), 0) / 60),
      bestSubject: rankedSubjects[0],
      focusSubject: rankedSubjects[rankedSubjects.length - 1],
      hasScores: scores.length > 0,
    };
  }, [scores, t]);

  const firstName = (user?.name || user?.full_name || user?.email || 'Student').split(' ')[0];
  const greeting = language === 'nl' ? `Goedemorgen, ${firstName}` : `Good morning, ${firstName}`;

  const renderSubject = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={styles.subjectCard}
      onPress={() => router.push({
        pathname: '/Modules',
        params: {
          subjectId: item.id,
          subjectTitle: item.title,
        }
      })}
    >
      <View style={styles.subjectIconPlaceholder}>
        {item.cover_image || item.icon ? (
          <Image source={{ uri: item.cover_image || item.icon || '' }} style={styles.subjectCover} />
        ) : (
          <Ionicons name="school-outline" size={24} color="#05C925" />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.subjectTitleText}>{item.title}</Text>
        <Text style={styles.subjectSubText} numberOfLines={1}>
          {item.description || t('noDescription')}
        </Text>
      </View>
      <Ionicons name="arrow-forward" size={22} color="#05C925" />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.whiteOverlay} />
      <LinearGradient
        colors={['white', 'white', 'transparent']}
        locations={[0, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.headerText}>{t('subjects')}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/create_subject')}>
            <Text style={styles.headerIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {message && (
          <View style={styles.messageWrap}>
            <AppMessage tone="warning" title={t('internetWarning')} message={message} />
          </View>
        )}

        {loading ? (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color="#05C925" />
          </View>
        ) : (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={(
              <View>
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={16} color="#05C925" />
                  <Text style={styles.streakBadgeText}>{learningAnalysis.streak} {t('dayStreak')}</Text>
                </View>

                <View style={styles.analysisCard}>
                  <View style={styles.analysisHeaderRow}>
                    <View>
                      <Text style={styles.analysisTitle}>{t('weeklyGoal')}</Text>
                      <Text style={styles.goalText}>{learningAnalysis.weeklyCompleted}/{WEEKLY_MODULE_GOAL} {t('modulesMade')}</Text>
                    </View>
                    <View style={styles.flameCircle}>
                      <Ionicons name="flame" size={34} color="#05C925" />
                    </View>
                  </View>
                  <View style={styles.goalTrack}>
                    <View style={[styles.goalFill, { width: `${learningAnalysis.weeklyProgress}%` }]} />
                  </View>

                  <Text style={styles.analysisLabel}>{t('recentProgress')}</Text>
                  {learningAnalysis.hasScores ? (
                    <View style={styles.progressFacts}>
                      <Text style={styles.factText}>{learningAnalysis.improvement >= 0 ? '+' : ''}{learningAnalysis.improvement}% {t('comparedLastWeek')}</Text>
                      <Text style={styles.factText}>{learningAnalysis.improvedQuestions} {t('questionsImproved')}</Text>
                      <Text style={styles.factText}>{learningAnalysis.learnedMinutes} {t('minutesLearned')}</Text>
                    </View>
                  ) : (
                    <Text style={styles.emptyAnalysisText}>{t('noLearningDataYet')}</Text>
                  )}
                </View>

                <View style={styles.personalCard}>
                  <Text style={styles.personalTitle}>{t('personalAnalysis')}</Text>
                  <Text style={styles.personalText}>{t('keepGoing')}</Text>
                  <View style={styles.analysisGrid}>
                    <View style={styles.analysisPill}>
                      <Text style={styles.pillLabel}>{t('bestSubject')}</Text>
                      <Text style={styles.pillValue}>{learningAnalysis.bestSubject?.title || '-'}</Text>
                    </View>
                    <View style={styles.analysisPill}>
                      <Text style={styles.pillLabel}>{t('focusSubject')}</Text>
                      <Text style={styles.pillValue}>{learningAnalysis.focusSubject?.title || '-'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={(
              <View style={styles.emptyState}>
                <Image source={require('../../assets/images/tab_inactive.png')} style={styles.contentImage} />
                <Text style={styles.contentTitle}>{t('noSubjects')}</Text>
                <Text style={styles.contentText}>{t('createFirstSubject')}</Text>
              </View>
            )}
            renderItem={renderSubject}
          />
        )}
        <CustomTabBar activeTab="Home" />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  whiteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  gradient: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1 },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    zIndex: 10,
  },
  greetingText: { fontSize: 13, color: '#555', fontWeight: '700', marginBottom: 3 },
  headerText: { fontSize: 28, fontWeight: 'bold', color: '#05C925' },
  headerIcon: { fontSize: 34, fontWeight: 'bold', color: '#05C925' },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageWrap: { paddingHorizontal: 20, marginBottom: 8 },
  contentTitle: { fontSize: 20, color: '#05C925', fontWeight: '600' },
  contentText: { fontSize: 16, color: '#333', textAlign: 'center' },
  contentImage: { width: 100, height: 100, marginBottom: 10 },
  listContainer: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 34 },
  streakBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#05C925',
    borderRadius: 999,
    backgroundColor: '#F0FFF4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  streakBadgeText: { color: '#333', fontSize: 13, fontWeight: '800' },
  analysisCard: {
    borderWidth: 1,
    borderColor: '#05C925',
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    padding: 14,
    marginBottom: 12,
  },
  analysisHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  analysisTitle: { color: '#333', fontSize: 16, fontWeight: '900' },
  goalText: { color: '#444', fontSize: 14, fontWeight: '800', marginTop: 10 },
  flameCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  goalTrack: { height: 18, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#05C925', overflow: 'hidden', marginTop: 12 },
  goalFill: { height: '100%', borderRadius: 999, backgroundColor: '#05C925' },
  analysisLabel: { color: '#555', fontSize: 12, fontWeight: '900', marginTop: 18, marginBottom: 8 },
  progressFacts: { gap: 3 },
  factText: { color: '#444', fontSize: 12, fontWeight: '700' },
  emptyAnalysisText: { color: '#555', fontSize: 12, fontWeight: '700', lineHeight: 17 },
  personalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  personalTitle: { color: '#05C925', fontSize: 17, fontWeight: '900' },
  personalText: { color: '#444', marginTop: 5, fontWeight: '700' },
  analysisGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  analysisPill: { flex: 1, borderRadius: 8, backgroundColor: '#F7FFF9', borderWidth: 1, borderColor: '#D8F8E2', padding: 10 },
  pillLabel: { color: '#777', fontSize: 11, fontWeight: '800' },
  pillValue: { color: '#333', fontSize: 13, fontWeight: '900', marginTop: 4 },
  subjectCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectIconPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#F0FFF0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  subjectCover: { width: '100%', height: '100%' },
  subjectTitleText: { fontSize: 18, fontWeight: '700', color: '#333' },
  subjectSubText: { fontSize: 14, color: '#666' },
});

