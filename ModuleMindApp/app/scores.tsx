import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';
import { useLanguage } from '../hooks/use-language';

type QuizScore = {
  id: string;
  userId: string;
  subjectId: number | null;
  subjectTitle: string;
  moduleId: number | null;
  moduleTitle: string;
  correct: number;
  total: number;
  percentage: number;
  completedAt: string;
  answers: {
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
};

type SubjectSummary = {
  subjectTitle: string;
  attempts: number;
  correct: number;
  total: number;
  percentage: number;
};

export default function ScoresScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);

  const loadScores = useCallback(async () => {
    try {
      setLoading(true);
      const user = await AsyncStorage.getItem('user');
      const userData = user ? JSON.parse(user) : {};
      const userId = String(userData.id || userData.user_id || 'guest');
      const storedScores = await AsyncStorage.getItem(`quizScores:${userId}`);
      setScores(storedScores ? JSON.parse(storedScores) : []);
    } catch (error) {
      console.error('Score load error:', error);
      setScores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScores();
    }, [loadScores])
  );

  const totals = useMemo(() => {
    const correct = scores.reduce((sum, score) => sum + score.correct, 0);
    const total = scores.reduce((sum, score) => sum + score.total, 0);
    return {
      attempts: scores.length,
      correct,
      total,
      percentage: total ? Math.round((correct / total) * 100) : 0,
    };
  }, [scores]);

  const subjectSummaries = useMemo(() => {
    const summaries = new Map<string, SubjectSummary>();
    scores.forEach((score) => {
      const key = score.subjectTitle || t('subject');
      const existing = summaries.get(key) || {
        subjectTitle: key,
        attempts: 0,
        correct: 0,
        total: 0,
        percentage: 0,
      };
      existing.attempts += 1;
      existing.correct += score.correct;
      existing.total += score.total;
      existing.percentage = existing.total ? Math.round((existing.correct / existing.total) * 100) : 0;
      summaries.set(key, existing);
    });
    return Array.from(summaries.values());
  }, [scores, t]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(language === 'nl' ? 'nl-BE' : language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05C925" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#05C925" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('scores')}</Text>
        </View>

        <FlatList
          data={scores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={(
            <View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t('totalScore')}</Text>
                <Text style={styles.summaryValue}>{totals.percentage}%</Text>
                <Text style={styles.summaryMeta}>{totals.correct}/{totals.total} {t('correct')} - {totals.attempts} {t('attempts')}</Text>
              </View>

              {subjectSummaries.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('perSubject')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectRow}>
                    {subjectSummaries.map((subject) => (
                      <View key={subject.subjectTitle} style={styles.subjectCard}>
                        <Text style={styles.subjectTitle} numberOfLines={1}>{subject.subjectTitle}</Text>
                        <Text style={styles.subjectPercentage}>{subject.percentage}%</Text>
                        <Text style={styles.subjectMeta}>{subject.correct}/{subject.total} {t('correct')}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.sectionTitle}>{t('perModule')}</Text>
            </View>
          )}
          ListEmptyComponent={(
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={42} color="#05C925" />
              <Text style={styles.emptyTitle}>{t('noScores')}</Text>
              <Text style={styles.emptyText}>{t('finishQuizForScores')}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const expanded = expandedScoreId === item.id;

            return (
              <TouchableOpacity
                style={styles.scoreCard}
                activeOpacity={0.9}
                onPress={() => setExpandedScoreId(expanded ? null : item.id)}
              >
                <View style={styles.scoreTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleTitle}>{item.moduleTitle}</Text>
                    <Text style={styles.scoreMeta}>{item.subjectTitle} - {formatDate(item.completedAt)}</Text>
                  </View>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{item.percentage}%</Text>
                  </View>
                </View>
                <Text style={styles.scoreLine}>{item.correct}/{item.total} {t('correct')}</Text>

                {expanded && (
                  <View style={styles.answerList}>
                    {item.answers.map((answer, index) => (
                      <View key={`${item.id}-${index}`} style={styles.answerRow}>
                        <Ionicons
                          name={answer.isCorrect ? 'checkmark-circle' : 'close-circle'}
                          size={20}
                          color={answer.isCorrect ? '#05C925' : '#FF5F5F'}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.answerQuestion}>{answer.question}</Text>
                          <Text style={styles.answerText}>{t('yourAnswer')}: {answer.selectedAnswer}</Text>
                          {!answer.isCorrect && <Text style={styles.answerText}>{t('correctAnswer')}: {answer.correctAnswer}</Text>}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
      <CustomTabBar activeTab="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  headerRow: { marginTop: 25, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', gap: 15 },
  backButton: {
    width: 55,
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#05C925',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#05C925' },
  listContent: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 120 },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 20,
    minHeight: 150,
    justifyContent: 'center',
  },
  summaryLabel: { fontSize: 15, color: '#777', fontWeight: '700' },
  summaryValue: { marginTop: 4, fontSize: 44, color: '#05C925', fontWeight: '900' },
  summaryMeta: { marginTop: 4, color: '#444', fontWeight: '600' },
  section: { marginTop: 24 },
  sectionTitle: { marginTop: 24, marginBottom: 12, fontSize: 18, fontWeight: '800', color: '#05C925' },
  subjectRow: { gap: 10, paddingRight: 25 },
  subjectCard: {
    width: 150,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#05C925',
    backgroundColor: '#F0FFF4',
    padding: 14,
  },
  subjectTitle: { color: '#333', fontWeight: '800' },
  subjectPercentage: { marginTop: 8, color: '#05C925', fontSize: 28, fontWeight: '900' },
  subjectMeta: { color: '#666', fontSize: 12, fontWeight: '600' },
  scoreCard: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 10,
  },
  scoreTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  moduleTitle: { fontSize: 16, color: '#333', fontWeight: '800' },
  scoreMeta: { marginTop: 3, color: '#777', fontSize: 12 },
  scoreBadge: { borderRadius: 999, backgroundColor: '#E9FBEF', paddingHorizontal: 12, paddingVertical: 6 },
  scoreBadgeText: { color: '#05C925', fontWeight: '900' },
  scoreLine: { marginTop: 10, color: '#555', fontWeight: '600' },
  answerList: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#EFEFEF', paddingTop: 12, gap: 12 },
  answerRow: { flexDirection: 'row', gap: 10 },
  answerQuestion: { color: '#333', fontWeight: '700' },
  answerText: { marginTop: 3, color: '#555', fontSize: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '800', color: '#333' },
  emptyText: { marginTop: 6, color: '#666', textAlign: 'center' },
});
