import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppMessage from '../components/AppMessage';
import CustomTabBar from '../components/CustomTabBar';
import { useLanguage } from '../hooks/use-language';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  correctAnswers: string[];
  type: 'single' | 'multiple' | 'open';
  explanation: string;
};

type SavedAnswer = {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

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
  answers: SavedAnswer[];
};

const asString = (value: unknown) => String(value ?? '').trim();

const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const normalizeOptions = (rawOptions: unknown) => {
  if (Array.isArray(rawOptions)) {
    return rawOptions.map(asString).filter(Boolean);
  }

  if (rawOptions && typeof rawOptions === 'object') {
    return Object.values(rawOptions).map(asString).filter(Boolean);
  }

  if (typeof rawOptions === 'string') {
    try {
      return normalizeOptions(JSON.parse(rawOptions));
    } catch {
      return rawOptions
        .split(/\r?\n|,/)
        .map((option) => option.replace(/^[A-Da-d][).:\-\s]+/, '').trim())
        .filter(Boolean);
    }
  }

  return [];
};

const normalizeQuestions = (rawQuestions: unknown): QuizQuestion[] => {
  let parsedQuestions = rawQuestions;

  if (typeof rawQuestions === 'string') {
    try {
      parsedQuestions = JSON.parse(rawQuestions);
    } catch {
      parsedQuestions = [];
    }
  }

  if (!Array.isArray(parsedQuestions)) return [];

  return parsedQuestions
    .map((item) => {
      const record = item as Record<string, unknown>;
      const options = normalizeOptions(record.options).length > 0
        ? normalizeOptions(record.options)
        : [record.option_a, record.option_b, record.option_c, record.option_d].map(asString).filter(Boolean);
      const correctAnswers = normalizeOptions(record.correctAnswers || record.correct_answers || record.answers);
      const correctAnswer = asString(record.correctAnswer || record.correct_answer || record.answer || correctAnswers[0]);
      const questionType = asString(record.type || record.questionType || record.question_type).toLowerCase();
      const type: QuizQuestion['type'] = questionType.includes('open')
        ? 'open'
        : questionType.includes('multi') || correctAnswers.length > 1
          ? 'multiple'
          : 'single';

      return {
        question: asString(record.question || record.title || record.prompt),
        options,
        correctAnswer,
        correctAnswers: correctAnswers.length > 0 ? correctAnswers : [correctAnswer].filter(Boolean),
        type,
        explanation: asString(record.explanation || record.feedback || record.reason),
      };
    })
    .filter((question) => question.question && (question.type === 'open' || question.options.length > 0) && question.correctAnswers.length > 0);
};

export default function QuizScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const moduleId = getParam(params.moduleId);
  const moduleTitle = getParam(params.moduleTitle) || 'Module';
  const subjectId = getParam(params.subjectId);
  const subjectTitle = getParam(params.subjectTitle) || 'Vak';

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [openAnswer, setOpenAnswer] = useState('');
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const selectedModule = await AsyncStorage.getItem('selectedModule');
      const moduleData = selectedModule ? JSON.parse(selectedModule) : null;
      const localQuestions = normalizeQuestions(moduleData?.questions || moduleData?.quiz || moduleData?.items);

      if (localQuestions.length > 0) {
        setQuestions(localQuestions);
        return;
      }

      const cachedById = moduleId ? await AsyncStorage.getItem(`moduleQuestionsById:${moduleId}`) : null;
      const cachedByTitle = subjectId && moduleTitle
        ? await AsyncStorage.getItem(`moduleQuestions:${subjectId}:${moduleTitle.trim().toLowerCase()}`)
        : null;

      for (const cachedModule of [cachedById, cachedByTitle]) {
        if (!cachedModule) continue;
        const cachedQuestions = normalizeQuestions(JSON.parse(cachedModule).questions);
        if (cachedQuestions.length > 0) {
          setQuestions(cachedQuestions);
          return;
        }
      }

      setQuestions([]);
    } catch {
      setMessage(t('loadQuizFailed'));
    } finally {
      setLoading(false);
    }
  }, [moduleId, moduleTitle, subjectId, t]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const progressText = useMemo(() => {
    if (questions.length === 0) return '0 / 0';
    return `${currentIndex + 1} / ${questions.length}`;
  }, [currentIndex, questions.length]);

  const saveScore = async (finalAnswers: SavedAnswer[]) => {
    setSaving(true);
    try {
      const user = await AsyncStorage.getItem('user');
      const userData = user ? JSON.parse(user) : {};
      const userId = String(userData.id || userData.user_id || 'guest');
      const correct = finalAnswers.filter((answer) => answer.isCorrect).length;
      const total = questions.length;
      const score: QuizScore = {
        id: `${Date.now()}-${moduleId || 'module'}`,
        userId,
        subjectId: subjectId ? Number(subjectId) : null,
        subjectTitle,
        moduleId: moduleId ? Number(moduleId) : null,
        moduleTitle,
        correct,
        total,
        percentage: total ? Math.round((correct / total) * 100) : 0,
        completedAt: new Date().toISOString(),
        answers: finalAnswers,
      };
      const storageKey = `quizScores:${userId}`;
      const storedScores = await AsyncStorage.getItem(storageKey);
      const scores = storedScores ? JSON.parse(storedScores) : [];
      await AsyncStorage.setItem(storageKey, JSON.stringify([score, ...scores]));
      router.replace('/scores');
    } catch {
      setMessage(t('saveScoreFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || selectedAnswer) return;
    if (currentQuestion.type === 'multiple') {
      setSelectedAnswers((current) => (
        current.includes(answer)
          ? current.filter((item) => item !== answer)
          : [...current, answer]
      ));
      return;
    }
    setSelectedAnswer(answer);
  };

  const normalizeAnswer = (value: string) => value.trim().toLowerCase();

  const isAnswerCorrect = (answerValue: string, selectedValues: string[]) => {
    if (!currentQuestion) return false;

    if (currentQuestion.type === 'multiple') {
      const selected = selectedValues.map(normalizeAnswer).sort();
      const correct = currentQuestion.correctAnswers.map(normalizeAnswer).sort();
      return selected.length === correct.length && selected.every((answer, index) => answer === correct[index]);
    }

    return currentQuestion.correctAnswers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(answerValue));
  };

  const feedbackText = () => {
    if (!currentQuestion) return '';
    if (currentQuestion.explanation) return currentQuestion.explanation;

    if (isCurrentCorrect) {
      return t('whyCorrect');
    }

    if (currentQuestion.type === 'multiple') {
      return `${t('whyWrong')} ${t('correctAnswer')}: ${currentQuestion.correctAnswers.join(', ')}`;
    }

    return `${t('whyWrong')} ${t('correctAnswer')}: ${currentQuestion.correctAnswer}`;
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    const answerValue = currentQuestion.type === 'open'
      ? openAnswer.trim()
      : currentQuestion.type === 'multiple'
        ? selectedAnswers.join(', ')
        : selectedAnswer || '';

    if (!answerValue) return;

    const answerRecord = {
      question: currentQuestion.question,
      selectedAnswer: answerValue,
      correctAnswer: currentQuestion.correctAnswers.join(', '),
      isCorrect: isAnswerCorrect(answerValue, selectedAnswers),
    };
    const nextAnswers = [...answers, answerRecord];

    if (isLastQuestion) {
      setAnswers(nextAnswers);
      saveScore(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setOpenAnswer('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05C925" />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>{moduleTitle}</Text>
            {message && <AppMessage tone="error" message={message} />}
            <View style={styles.questionCard}>
              <Text style={styles.emptyTitle}>Geen quizvragen gevonden</Text>
              <Text style={styles.emptyText}>Deze module bevat geen quizvragen in de app-cache. Modules die voor deze update zijn gemaakt moeten opnieuw gegenereerd of opgeslagen worden.</Text>
            </View>
            <TouchableOpacity style={styles.forwardButton} onPress={() => router.back()}>
            <Text style={styles.forwardText}>{t('back')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  const hasAnswered = currentQuestion.type === 'open'
    ? openAnswer.trim().length > 0 && Boolean(selectedAnswer)
    : currentQuestion.type === 'multiple'
      ? selectedAnswers.length > 0 && Boolean(selectedAnswer)
      : Boolean(selectedAnswer);
  const isCurrentCorrect = currentQuestion.type === 'open'
    ? isAnswerCorrect(openAnswer, [])
    : currentQuestion.type === 'multiple'
      ? isAnswerCorrect(selectedAnswers.join(', '), selectedAnswers)
      : selectedAnswer ? isAnswerCorrect(selectedAnswer, []) : false;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#05C925" />
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title} numberOfLines={2}>{moduleTitle}</Text>
              <Text style={styles.subjectText}>{subjectTitle} · {progressText}</Text>
            </View>
          </View>

          {message && <AppMessage tone="error" message={message} />}

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.optionsList}>
            {currentQuestion.type === 'open' ? (
              <View>
                <TextInput
                  style={styles.openInput}
                  value={openAnswer}
                  onChangeText={setOpenAnswer}
                  placeholder={t('typeAnswer')}
                  multiline
                  editable={!selectedAnswer}
                />
                {!selectedAnswer && (
                  <TouchableOpacity
                    style={[styles.forwardButton, !openAnswer.trim() && styles.disabledButton]}
                    disabled={!openAnswer.trim()}
                    onPress={() => setSelectedAnswer(openAnswer.trim())}
                  >
                    <Text style={styles.forwardText}>{t('save')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isSelectedMultiple = selectedAnswers.includes(option);
              const isCorrectOption = currentQuestion.correctAnswers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(option));
              const showCorrect = Boolean(selectedAnswer && isCorrectOption);
              const showWrong = Boolean(selectedAnswer && (isSelected || isSelectedMultiple) && !isCorrectOption);

              return (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  activeOpacity={0.85}
                  onPress={() => handleAnswer(option)}
                >
                  <View style={[
                    styles.radioCircle,
                    currentQuestion.type === 'multiple' && styles.checkboxCircle,
                    isSelectedMultiple && !selectedAnswer && styles.radioPending,
                    showCorrect && styles.radioCorrect,
                    showWrong && styles.radioWrong,
                  ]}>
                    {(showCorrect || showWrong || (isSelectedMultiple && !selectedAnswer)) && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[
                    styles.optionText,
                    showCorrect && styles.optionTextCorrect,
                    showWrong && styles.optionTextWrong,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {currentQuestion.type === 'multiple' && !selectedAnswer && (
            <TouchableOpacity
              style={[styles.forwardButton, selectedAnswers.length === 0 && styles.disabledButton]}
              disabled={selectedAnswers.length === 0}
              onPress={() => setSelectedAnswer(selectedAnswers.join(', '))}
            >
              <Text style={styles.forwardText}>{t('save')}</Text>
            </TouchableOpacity>
          )}

          {hasAnswered && (
            <View style={[styles.feedbackBox, isCurrentCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={styles.feedbackTitle}>{isCurrentCorrect ? t('correct') : t('wrongAnswer')}</Text>
              <Text style={styles.feedbackLabel}>{t('detailedFeedback')}</Text>
              <Text style={styles.feedbackText}>
                {feedbackText()}
              </Text>
            </View>
          )}

          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButtonOutline} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.forwardButton, (!hasAnswered || saving) && styles.disabledButton]}
              disabled={!hasAnswered || saving}
              onPress={handleNext}
            >
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.forwardText}>{isLastQuestion ? t('save') : t('continue')}</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <CustomTabBar activeTab="Modules" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  headerTextWrap: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#05C925', marginBottom: 4 },
  subjectText: { color: '#777', fontWeight: '600' },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 20,
    minHeight: 180,
    justifyContent: 'center',
  },
  questionText: { fontSize: 18, color: '#444', lineHeight: 26, textAlign: 'center', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 25 },
  optionsList: { paddingHorizontal: 5 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  radioCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCorrect: { backgroundColor: '#05C925', borderColor: '#05C925' },
  radioWrong: { backgroundColor: '#FF5F5F', borderColor: '#FF5F5F' },
  radioPending: { backgroundColor: '#E9FBEF', borderColor: '#05C925' },
  checkboxCircle: { borderRadius: 8 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' },
  optionText: { fontSize: 15, color: '#333', flex: 1 },
  optionTextCorrect: { color: '#05C925', fontWeight: '700' },
  optionTextWrong: { color: '#FF5F5F', fontWeight: '700' },
  openInput: {
    minHeight: 130,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 15,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  feedbackBox: { borderRadius: 15, borderWidth: 1, padding: 15, marginTop: 4 },
  feedbackCorrect: { borderColor: '#05C925', backgroundColor: '#F0FFF4' },
  feedbackWrong: { borderColor: '#FF5F5F', backgroundColor: '#FFF3F3' },
  feedbackTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  feedbackLabel: { marginTop: 8, color: '#777', fontSize: 12, fontWeight: '800' },
  feedbackText: { marginTop: 4, color: '#555', lineHeight: 20 },
  navRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 24 },
  backButton: {
    width: 55,
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#05C925',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonOutline: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#05C925',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { color: '#05C925', fontWeight: '700' },
  forwardButton: {
    backgroundColor: '#05C925',
    height: 55,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  forwardText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  disabledButton: { opacity: 0.45 },
  emptyTitle: { textAlign: 'center', color: '#05C925', fontWeight: '800', fontSize: 18 },
  emptyText: { textAlign: 'center', color: '#555', marginTop: 8 },
});
