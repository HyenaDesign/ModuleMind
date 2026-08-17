import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';
import AppMessage from '../../components/AppMessage';
import { getStoredUser, isTeacherUser } from '../../constants/account';
import { useLanguage } from '../../hooks/use-language';

type SavedAnswer = {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type QuizScore = {
  id: string;
  userId: string;
  subjectTitle: string;
  moduleTitle: string;
  correct: number;
  total: number;
  percentage: number;
  completedAt: string;
  answers: SavedAnswer[];
};

type StudentProgress = {
  id: string;
  name: string;
  className: string;
  scores: QuizScore[];
  averageScore: number;
  completion: number;
  recentModule: string;
  needsAttention: boolean;
};

const demoStudents: StudentProgress[] = [
  { id: 'demo-jeffrey', name: 'Jeffrey', className: '3XD', scores: [], averageScore: 82, completion: 78, recentModule: 'Biology', needsAttention: false },
  { id: 'demo-emma', name: 'Emma', className: '3XD', scores: [], averageScore: 64, completion: 58, recentModule: 'Physics', needsAttention: true },
  { id: 'demo-jonas', name: 'Jonas', className: '3XD', scores: [], averageScore: 71, completion: 66, recentModule: 'Chemistry', needsAttention: false },
];

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export default function TeacherScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'students' | 'classes' | 'dashboard'>('students');
  const [students, setStudents] = useState<StudentProgress[]>([]);

  const loadTeacherData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const user = await getStoredUser();

      if (!user) {
        router.replace('/signin');
        return;
      }

      if (!isTeacherUser(user)) {
        router.replace('/(tabs)/Home');
        return;
      }

      const keys = await AsyncStorage.getAllKeys();
      const scoreKeys = keys.filter((key) => key.startsWith('quizScores:'));
      const scorePairs = await AsyncStorage.multiGet(scoreKeys);
      const localStudents = scorePairs.map(([key, value]) => {
        const userId = key.replace('quizScores:', '');
        const parsedScores: QuizScore[] = value ? JSON.parse(value) : [];
        const correct = parsedScores.reduce((sum, score) => sum + score.correct, 0);
        const total = parsedScores.reduce((sum, score) => sum + score.total, 0);
        const averageScore = total ? Math.round((correct / total) * 100) : 0;
        const completedModules = new Set(parsedScores.map((score) => score.moduleTitle)).size;
        const completion = clampPercent(completedModules * 20);
        const recentModule = parsedScores[0]?.subjectTitle || parsedScores[0]?.moduleTitle || t('module');

        return {
          id: userId,
          name: userId === String(user.id || user.user_id) ? (user.name || user.full_name || t('name')) : `Student ${userId}`,
          className: '3XD',
          scores: parsedScores,
          averageScore,
          completion,
          recentModule,
          needsAttention: averageScore > 0 && averageScore < 70,
        };
      });

      setStudents(localStudents.length > 0 ? localStudents : demoStudents);
    } catch {
      setMessage(t('somethingWentWrong'));
      setStudents(demoStudents);
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useFocusEffect(
    useCallback(() => {
      loadTeacherData();
    }, [loadTeacherData])
  );

  const classStats = useMemo(() => {
    const averageScore = students.length
      ? Math.round(students.reduce((sum, student) => sum + student.averageScore, 0) / students.length)
      : 0;
    const completion = students.length
      ? Math.round(students.reduce((sum, student) => sum + student.completion, 0) / students.length)
      : 0;
    const attention = students.filter((student) => student.needsAttention);
    const recentModules = students.reduce<Record<string, number>>((acc, student) => {
      acc[student.recentModule] = (acc[student.recentModule] || 0) + 1;
      return acc;
    }, {});

    return {
      averageScore,
      completion,
      attention,
      recentModules: Object.entries(recentModules).map(([title, count]) => ({ title, count })),
    };
  }, [students]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05C925" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF', '#F2FFD7']} locations={[0, 0.72, 1]} style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('teacherDashboard')}</Text>
          <Text style={styles.subtitle}>3XD - {students.length} {t('students').toLowerCase()}</Text>
        </View>

        {message && (
          <View style={styles.messageWrap}>
            <AppMessage tone="warning" message={message} />
          </View>
        )}

        <View style={styles.segmentedControl}>
          {([
            { id: 'students', label: t('students'), icon: 'people-outline' },
            { id: 'classes', label: t('classes'), icon: 'school-outline' },
            { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
          ] as const).map((item) => {
            const active = activeView === item.id;
            return (
              <TouchableOpacity key={item.id} style={[styles.segment, active && styles.segmentActive]} onPress={() => setActiveView(item.id)}>
                <Ionicons name={item.icon as any} size={18} color={active ? '#05C925' : '#555'} />
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeView === 'students' && (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={(
              <View>
                <Text style={styles.sectionTitle}>{t('students')}</Text>
                <View style={styles.metricRow}>
                  <MetricCard label={t('averageScore')} value={classStats.averageScore} strong />
                  <MetricCard label={t('completion')} value={classStats.completion} />
                </View>
                <Text style={styles.sectionTitle}>{t('attentionNeeded')}</Text>
                {classStats.attention.length === 0 ? (
                  <View style={styles.noticeCard}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#05C925" />
                    <Text style={styles.noticeText}>Geen leerlingen onder 70%.</Text>
                  </View>
                ) : classStats.attention.map((student) => (
                  <View key={student.id} style={styles.warningCard}>
                    <Ionicons name="alert-circle-outline" size={24} color="#E98A00" />
                    <Text style={styles.warningText}>{student.name}: {student.averageScore}% {t('averageScore').toLowerCase()}</Text>
                  </View>
                ))}
                <Text style={styles.sectionTitle}>{t('recentModules')}</Text>
              </View>
            )}
            renderItem={({ item }) => <StudentCard student={item} t={t} />}
          />
        )}

        {activeView === 'classes' && (
          <ScrollView contentContainerStyle={styles.listContent}>
            <Text style={styles.sectionTitle}>{t('classes')}</Text>
            {students.map((student) => <StudentCard key={student.id} student={student} t={t} compact />)}
          </ScrollView>
        )}

        {activeView === 'dashboard' && (
          <ScrollView contentContainerStyle={styles.listContent}>
            <Text style={styles.sectionTitle}>{t('classPerformance')}</Text>
            <View style={styles.metricRow}>
              <MetricCard label={t('averageScore')} value={classStats.averageScore} strong />
              <MetricCard label={t('completion')} value={classStats.completion} />
            </View>
            <Text style={styles.sectionTitle}>{t('attentionNeeded')}</Text>
            <View style={styles.dashboardAlert}>
              <View style={styles.avatarCluster}>
                {classStats.attention.slice(0, 3).map((student) => <View key={student.id} style={styles.avatarDot} />)}
              </View>
              <Text style={styles.dashboardAlertText}>{classStats.attention.length} students struggling with recent modules</Text>
              <View style={styles.dashboardButton} />
            </View>
            <Text style={styles.sectionTitle}>{t('recentModules')}</Text>
            {classStats.recentModules.map((module) => (
              <View key={module.title} style={styles.moduleProgressCard}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <ProgressBar value={clampPercent((module.count / Math.max(students.length, 1)) * 100)} color="#05C925" />
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
      <CustomTabBar activeTab="Teacher" />
    </LinearGradient>
  );
}

function MetricCard({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View style={[styles.metricCard, strong && styles.metricCardStrong]}>
      <Text style={[styles.metricValue, strong && styles.metricValueStrong]}>{value}</Text>
      <Text style={[styles.metricLabel, strong && styles.metricLabelStrong]}>{label}</Text>
    </View>
  );
}

function StudentCard({ student, t, compact }: { student: StudentProgress; t: (key: any) => string; compact?: boolean }) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentMeta}>{student.className} - {student.recentModule}</Text>
        </View>
        {student.needsAttention && <Ionicons name="alert-circle" size={22} color="#E98A00" />}
      </View>
      <Text style={styles.progressLabel}>{t('progress')}</Text>
      <ProgressBar value={student.completion} color="#F4D64C" />
      {!compact && (
        <>
          <Text style={styles.progressLabel}>{t('averageScore')}</Text>
          <ProgressBar value={student.averageScore} color="#05C925" />
        </>
      )}
    </View>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clampPercent(value)}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  header: { paddingHorizontal: 22, paddingTop: 42, paddingBottom: 12 },
  title: { color: '#05C925', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#444', marginTop: 4, fontWeight: '700' },
  messageWrap: { paddingHorizontal: 22, marginBottom: 10 },
  segmentedControl: { flexDirection: 'row', gap: 8, paddingHorizontal: 22, marginBottom: 8 },
  segment: { flex: 1, minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  segmentActive: { borderColor: '#05C925', backgroundColor: '#E9FBEF' },
  segmentText: { color: '#555', fontSize: 12, fontWeight: '800' },
  segmentTextActive: { color: '#05C925' },
  listContent: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 125 },
  sectionTitle: { color: '#05C925', fontSize: 17, fontWeight: '900', marginTop: 18, marginBottom: 10 },
  metricRow: { flexDirection: 'row', gap: 12 },
  metricCard: { flex: 1, minHeight: 106, borderWidth: 1, borderColor: '#05C925', borderRadius: 8, backgroundColor: '#E9FBEF', alignItems: 'center', justifyContent: 'center' },
  metricCardStrong: { backgroundColor: '#05C925' },
  metricValue: { color: '#333', fontSize: 26, fontWeight: '900' },
  metricValueStrong: { color: '#333' },
  metricLabel: { marginTop: 6, color: '#333', fontSize: 12, fontWeight: '800' },
  metricLabelStrong: { color: '#053B12' },
  noticeCard: { minHeight: 58, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D8F8E2', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeText: { color: '#555', fontWeight: '700' },
  warningCard: { minHeight: 58, borderRadius: 8, backgroundColor: '#FFF8E8', borderWidth: 1, borderColor: '#FFC65C', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  warningText: { flex: 1, color: '#444', fontWeight: '700' },
  studentCard: { backgroundColor: '#FFF', borderRadius: 8, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  studentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  studentAvatar: { width: 22, height: 22, borderRadius: 7, backgroundColor: '#A3A3A3' },
  studentName: { color: '#333', fontSize: 15, fontWeight: '900' },
  studentMeta: { color: '#777', fontSize: 12, marginTop: 2 },
  progressLabel: { color: '#444', fontSize: 12, fontWeight: '800', marginTop: 8, marginBottom: 6 },
  progressTrack: { height: 16, borderRadius: 999, backgroundColor: '#E6FAEE', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  dashboardAlert: { minHeight: 92, borderRadius: 8, borderWidth: 1, borderColor: '#FF6B6B', backgroundColor: '#FFF1F1', flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatarCluster: { width: 78, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  avatarDot: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#A3A3A3' },
  dashboardAlertText: { flex: 1, color: '#555', fontSize: 12, fontWeight: '700' },
  dashboardButton: { width: 68, height: 20, borderRadius: 4, backgroundColor: '#05C925' },
  moduleProgressCard: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  moduleTitle: { color: '#555', fontWeight: '800', marginBottom: 7 },
});
