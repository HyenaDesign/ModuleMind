import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, Image,
  SafeAreaView, ActivityIndicator, ScrollView, TextInput, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppMessage from '../components/AppMessage';
import { useLanguage } from '../hooks/use-language';
import CustomTabBar from '../components/CustomTabBar';
import { FREE_MODULE_LIMIT, getStoredUser, isPremiumUser } from '../constants/account';

type QuestionType = 'single' | 'multiple' | 'open';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  correctAnswers: string[];
  type: QuestionType;
  explanation: string;
};

const asString = (value: unknown) => String(value ?? '').trim();

const normalizeOptions = (rawOptions: unknown) => {
  if (Array.isArray(rawOptions)) {
    return rawOptions.map(asString).filter(Boolean);
  }

  if (rawOptions && typeof rawOptions === 'object') {
    return Object.values(rawOptions).map(asString).filter(Boolean);
  }

  if (typeof rawOptions === 'string') {
    try {
      const parsedOptions = JSON.parse(rawOptions);
      return normalizeOptions(parsedOptions);
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
  if (!Array.isArray(rawQuestions)) return [];

  return rawQuestions
    .map((item) => {
      const record = item as Record<string, unknown>;
      const options = normalizeOptions(record.options).length > 0
        ? normalizeOptions(record.options)
        : [record.option_a, record.option_b, record.option_c, record.option_d].map(asString).filter(Boolean);
      const correctAnswers = normalizeOptions(record.correctAnswers || record.correct_answers || record.answers);
      const correctAnswer = asString(record.correctAnswer || record.correct_answer || record.answer || correctAnswers[0]);
      const questionType = asString(record.type || record.questionType || record.question_type).toLowerCase();
      const type: QuestionType = questionType.includes('open')
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

export default function CreateModuleScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { subjectId, subjectTitle, moduleCount, isPremium: premiumParam } = useLocalSearchParams();
  const selectedSubjectId = Array.isArray(subjectId) ? subjectId[0] : subjectId;
  const selectedSubjectTitle = Array.isArray(subjectTitle) ? subjectTitle[0] : subjectTitle;
  const currentModuleCount = Number(Array.isArray(moduleCount) ? moduleCount[0] : moduleCount || 0);
  const isPremiumFromParams = (Array.isArray(premiumParam) ? premiumParam[0] : premiumParam) === 'true';

  // Navigation & Loading State
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Finalize
  const [isProcessing, setIsProcessing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data State
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coverImage, setCoverImage] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Step 3 Metadata State (afbeelding_7.png)
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [message, setMessage] = useState<{ text: string; tone: 'error' | 'warning' | 'success' } | null>(null);

  const ensureStorageAvailable = async () => {
    const user = await getStoredUser();
    const premium = isPremiumFromParams || isPremiumUser(user);

    if (!premium && currentModuleCount >= FREE_MODULE_LIMIT) {
      setMessage({ text: t('storageLimitReached'), tone: 'warning' });
      router.push('/premium');
      return false;
    }

    return true;
  };

  // --- STEP 1 LOGIC: PICK FILE ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result);
      }
    } catch {
      setMessage({ text: t('fileLoadFailed'), tone: 'error' });
    }
  };

  const pickCoverImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setCoverImage(result.assets[0]);
      }
    } catch {
      setMessage({ text: t('fileLoadFailed'), tone: 'error' });
    }
  };

  // --- STEP 1 LOGIC: GENERATE AI ---
  const handleGenerateAI = async () => {
    if (!file || !file.assets) return;
    if (!(await ensureStorageAvailable())) return;
    setIsProcessing(true);
    setMessage(null);

    try {
      const selectedFile = file.assets[0];
      const formData = new FormData();

      let type = selectedFile.mimeType;
      if (!type || type === 'application/octet-stream') {
        if (selectedFile.name.toLowerCase().endsWith('.pdf')) type = 'application/pdf';
        else if (selectedFile.name.toLowerCase().endsWith('.docx')) type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (selectedFile.name.toLowerCase().endsWith('.txt')) type = 'text/plain';
      }

      const normalizedModel = selectedModel === 'gpt-3.5' ? 'gpt-3.5-turbo' : selectedModel;

      if (Platform.OS === 'web') {
        const webFile = (selectedFile as any).file;
        if (webFile instanceof Blob) {
          formData.append('file', webFile, selectedFile.name || 'document');
        } else {
          formData.append('file', new Blob([selectedFile.uri], { type: type || 'application/octet-stream' }), selectedFile.name || 'document');
        }
      } else {
        // @ts-ignore
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name || 'document',
          type: type || 'application/octet-stream',
        });
      }

      formData.append('model', normalizedModel);
      formData.append('questionTypes', JSON.stringify(['single', 'multiple', 'open']));
      formData.append('includeExplanations', 'true');
      formData.append('question_types', JSON.stringify(['single', 'multiple', 'open']));
      formData.append('include_explanations', 'true');

      console.log('Attempting AI generation...', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: type,
        model: normalizedModel,
        platform: Platform.OS,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout

      const response = await fetch('https://modulemindapi-production.up.railway.app/generate-quiz', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      console.log('Response Status:', response.status);
      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Non-JSON response received:', responseText.substring(0, 200));
        setMessage({ text: t('generationFailed'), tone: 'error' });
        return;
      }

      if (response.ok && data.questions) {
        const normalizedQuestions = normalizeQuestions(data.questions);

        if (normalizedQuestions.length === 0) {
          setMessage({ text: t('invalidGeneratedQuestions'), tone: 'error' });
          return;
        }

        setQuestions(normalizedQuestions);
        setStep(2);
      } else {
        console.log('API Error Data:', data);
        setMessage({ text: data.message || t('generationFailed'), tone: 'error' });
      }
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      if (error.name === 'AbortError') {
        setMessage({ text: language === 'nl' ? 'De aanvraag duurde te lang. Probeer een kleiner bestand.' : 'Request timed out. Try a smaller file.', tone: 'error' });
      } else {
        setMessage({ text: t('noInternet'), tone: 'warning' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // --- STEP 2 LOGIC: EDITING ---
  const updateQuestionText = (text: string) => {
    const newQuestions = [...questions];
    newQuestions[currentIndex].question = text;
    setQuestions(newQuestions);
  };

  const updateOptionText = (text: string, index: number) => {
    const newQuestions = [...questions];
    const currentQ = newQuestions[currentIndex];
    if (currentQ.correctAnswers.includes(currentQ.options[index])) {
      currentQ.correctAnswers = currentQ.correctAnswers.map((answer) => answer === currentQ.options[index] ? text : answer);
      currentQ.correctAnswer = text;
    }
    currentQ.options[index] = text;
    setQuestions(newQuestions);
  };

  const toggleCorrectAnswer = (optionText: string) => {
    const newQuestions = [...questions];
    const currentQ = newQuestions[currentIndex];
    if (currentQ.type === 'multiple') {
      currentQ.correctAnswers = currentQ.correctAnswers.includes(optionText)
        ? currentQ.correctAnswers.filter((answer) => answer !== optionText)
        : [...currentQ.correctAnswers, optionText];
      currentQ.correctAnswer = currentQ.correctAnswers.join(', ');
    } else {
      currentQ.correctAnswers = [optionText];
      currentQ.correctAnswer = optionText;
    }
    setQuestions(newQuestions);
  };

  const updateQuestionType = (type: QuestionType) => {
    const newQuestions = [...questions];
    const currentQ = newQuestions[currentIndex];
    currentQ.type = type;
    if (type === 'open') {
      currentQ.options = [];
      currentQ.correctAnswers = [currentQ.correctAnswer || currentQ.correctAnswers[0] || ''];
    } else if (currentQ.options.length === 0) {
      currentQ.options = ['', '', '', ''];
    }
    setQuestions(newQuestions);
  };

  const updateCorrectOpenAnswer = (text: string) => {
    const newQuestions = [...questions];
    newQuestions[currentIndex].correctAnswer = text;
    newQuestions[currentIndex].correctAnswers = [text];
    setQuestions(newQuestions);
  };

  const updateExplanation = (text: string) => {
    const newQuestions = [...questions];
    newQuestions[currentIndex].explanation = text;
    setQuestions(newQuestions);
  };

  // --- STEP 3 LOGIC: SAVE TO DB ---
  const handleSaveModule = async () => {
    if (!moduleTitle.trim()) {
      setMessage({ text: t('moduleTitleRequired'), tone: 'warning' });
      return;
    }
    const subjectIdNumber = Number(selectedSubjectId);
    if (!selectedSubjectId || Number.isNaN(subjectIdNumber)) {
      setMessage({ text: t('subjectRequired'), tone: 'warning' });
      router.replace('/(tabs)/Home');
      return;
    }
    if (!(await ensureStorageAvailable())) return;

    setSaving(true);
    try {
      const response = await fetch('https://modulemindapi-production.up.railway.app/save-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: subjectIdNumber,
          title: moduleTitle,
          description: moduleDesc,
          questions: questions
        }),
      });

      if (response.ok) {
        const responseText = await response.text();
        let data: any = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          data = {};
        }

        const savedModuleId = data.id || data.module_id || data.module?.id;
        const cachedModule = {
          id: savedModuleId || null,
          subject_id: subjectIdNumber,
          title: moduleTitle,
          description: moduleDesc,
          cover_image: coverImage?.uri || null,
          icon: coverImage?.uri || null,
          questions,
          subjectTitle: selectedSubjectTitle,
        };

        await AsyncStorage.setItem(
          `moduleQuestions:${subjectIdNumber}:${moduleTitle.trim().toLowerCase()}`,
          JSON.stringify(cachedModule)
        );

        if (savedModuleId) {
          await AsyncStorage.setItem(`moduleQuestionsById:${savedModuleId}`, JSON.stringify(cachedModule));
          if (coverImage?.uri) {
            await AsyncStorage.setItem(`moduleCover:${savedModuleId}`, coverImage.uri);
          }
        }

        setMessage({ text: t('moduleSaved'), tone: 'success' });
        router.back();
      } else {
        setMessage({ text: t('moduleSaveFailed'), tone: 'error' });
      }
    } catch {
      setMessage({ text: t('moduleSaveFailed'), tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {message && <AppMessage tone={message.tone} message={message.text} />}
          
          {/* --- STEP 1: UPLOAD --- */}
          {step === 1 && (
            <>
              <Text style={styles.title}>{selectedSubjectTitle ? `${language === 'nl' ? 'Module maken voor' : 'Create module for'} ${selectedSubjectTitle}` : t('createFirstModule')}</Text>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>1. {language === 'nl' ? 'Upload bestanden' : 'Upload files'}</Text>
                <TouchableOpacity 
                  style={[styles.uploadBox, file ? styles.uploadBoxActive : null]} 
                  onPress={pickDocument}
                >
                  <Text style={[styles.uploadTitle, file ? {color: '#05C925'} : null]}>
                    {file ? (language === 'nl' ? 'Bestand geladen!' : 'File loaded!') : (language === 'nl' ? 'Klik om te uploaden' : 'Click to upload')}
                  </Text>
                  <Text style={styles.uploadSubtitle}>{file?.assets?.[0]?.name ?? "PDF, DOCX of TXT"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>2. {language === 'nl' ? 'Kies AI Model' : 'Choose AI Model'}</Text>
                {['gpt-4o', 'gpt-3.5'].map((m) => (
                  <TouchableOpacity 
                    key={m}
                    style={[styles.modelCard, selectedModel === m && styles.selectedModelCard]}
                    onPress={() => setSelectedModel(m)}
                  >
                    <Text style={styles.modelName}>{m === 'gpt-4o' ? 'OpenAI GPT-4o' : 'GPT-3.5 Turbo'}</Text>
                    <Text style={styles.modelDesc}>{m === 'gpt-4o' ? (language === 'nl' ? 'Meest accuraat' : 'Most accurate') : (language === 'nl' ? 'Sneller' : 'Faster')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateAI} disabled={isProcessing}>
                {isProcessing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('generateQuestions')}</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* --- STEP 2: REVIEW (afbeelding_6.png) --- */}
          {step === 2 && questions.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <View style={styles.editIconContainer}>
                <View style={styles.editBox}>
                  <Ionicons name="pencil" size={20} color="#05C925" />
                </View>
              </View>

              <View style={styles.questionCard}>
                <TextInput
                  style={styles.questionInput}
                  multiline
                  value={questions[currentIndex].question}
                  onChangeText={updateQuestionText}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.optionsList}>
                <Text style={styles.sectionLabel}>{t('questionType')}</Text>
                <View style={styles.typeRow}>
                  {(['single', 'multiple', 'open'] as QuestionType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typePill, questions[currentIndex].type === type && styles.typePillActive]}
                      onPress={() => updateQuestionType(type)}
                    >
                      <Text style={[styles.typePillText, questions[currentIndex].type === type && styles.typePillTextActive]}>
                        {type === 'single' ? t('singleChoice') : type === 'multiple' ? t('multipleChoice') : t('openQuestion')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {questions[currentIndex].type === 'open' ? (
                  <TextInput
                    style={styles.inputField}
                    placeholder={t('correctAnswer')}
                    value={questions[currentIndex].correctAnswer}
                    onChangeText={updateCorrectOpenAnswer}
                  />
                ) : questions[currentIndex].options.map((opt, i) => {
  const optStr = String(opt || "");

  const isCorrect = questions[currentIndex].correctAnswers.some((answer) => optStr.trim().toLowerCase() === answer.trim().toLowerCase());

  return (
    <View key={i} style={styles.optionRow}>
      <TouchableOpacity 
        style={[styles.radioCircle, isCorrect && styles.radioActive]}
        onPress={() => toggleCorrectAnswer(optStr)}
      >
        {isCorrect && <View style={styles.radioInner} />}
      </TouchableOpacity>
      <TextInput
        style={[styles.optionInput, isCorrect && styles.optionTextCorrect]}
        value={optStr}
        onChangeText={(t) => updateOptionText(t, i)}
      />
    </View>
  );
})}
                <Text style={styles.sectionLabel}>{t('detailedFeedback')}</Text>
                <TextInput
                  style={[styles.inputField, { height: 90, textAlignVertical: 'top' }]}
                  multiline
                  placeholder={t('detailedFeedback')}
                  value={questions[currentIndex].explanation}
                  onChangeText={updateExplanation}
                />
              </View>

              <View style={styles.navRow}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                >
                  <Ionicons name="arrow-back" size={24} color="#05C925" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.forwardButton}
                  onPress={() => currentIndex < questions.length - 1 ? setCurrentIndex(currentIndex + 1) : setStep(3)}
                >
                  <Text style={styles.forwardText}>{currentIndex === questions.length - 1 ? (language === 'nl' ? 'Afronden' : 'Finish') : (language === 'nl' ? 'Doorgaan' : 'Continue')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* --- STEP 3: FINALIZE (afbeelding_7.png) --- */}
          {step === 3 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.title}>{selectedSubjectTitle ? `${language === 'nl' ? 'Module maken voor' : 'Create module for'} ${selectedSubjectTitle}` : t('createFirstModule')}</Text>

              <TouchableOpacity style={styles.imageUploadPlaceholder} onPress={pickCoverImage}>
                {coverImage?.uri ? (
                  <Image source={{ uri: coverImage.uri }} style={styles.coverImage} />
                ) : (
                  <Ionicons name="image-outline" size={50} color="#CCC" />
                )}
                <View style={styles.addIconSmall}>
                  <Ionicons name="add" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.coverLabel}>{coverImage ? t('coverLoaded') : t('uploadCover')}</Text>

              <TextInput
                style={styles.inputField}
                placeholder={t('enterTitle')}
                value={moduleTitle}
                onChangeText={setModuleTitle}
              />

              <TextInput
                style={[styles.inputField, { height: 100, textAlignVertical: 'top' }]}
                placeholder={t('descriptionOptional')}
                multiline
                value={moduleDesc}
                onChangeText={setModuleDesc}
              />

              <View style={styles.navRow}>
                <TouchableOpacity style={styles.backButtonOutline} onPress={() => setStep(2)}>
                  <Text style={{ color: '#05C925', fontWeight: '700' }}>{language === 'nl' ? 'Verder bewerken' : 'Edit more'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forwardButton} onPress={handleSaveModule} disabled={saving}>
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.forwardText}>{t('continue')}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
      <CustomTabBar activeTab="Modules" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '800', color: '#05C925', marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 18, fontWeight: '700', color: '#05C925', marginBottom: 12 },
  uploadBox: { height: 160, borderWidth: 2, borderColor: '#EEE', borderStyle: 'dashed', borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  uploadBoxActive: { borderColor: '#05C925', backgroundColor: '#F0FFF4', borderStyle: 'solid' },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: '#999' },
  uploadSubtitle: { fontSize: 12, color: '#AAA', marginTop: 4 },
  modelCard: { padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#EEE', marginBottom: 10, backgroundColor: '#FFF' },
  selectedModelCard: { borderColor: '#05C925', backgroundColor: '#F0FFF4' },
  modelName: { fontSize: 16, fontWeight: '700', color: '#333' },
  modelDesc: { fontSize: 12, color: '#999' },
  primaryButton: { backgroundColor: '#05C925', padding: 18, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  // Review/Finalize Styles
  editIconContainer: { marginBottom: 15 },
  editBox: { padding: 6, borderRadius: 8, borderWidth: 1, borderColor: '#05C925', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  questionCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', padding: 20, minHeight: 180 },
  questionInput: { fontSize: 15, color: '#444', lineHeight: 22, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 25 },
  optionsList: { paddingHorizontal: 5 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  radioCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#E5E5E5', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  radioActive: { backgroundColor: '#05C925', borderColor: '#05C925' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' },
  optionInput: { fontSize: 15, color: '#333', flex: 1 },
  optionTextCorrect: { color: '#05C925', fontWeight: '600' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typePill: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF' },
  typePillActive: { borderColor: '#05C925', backgroundColor: '#E9FBEF' },
  typePillText: { color: '#555', fontWeight: '700', fontSize: 12 },
  typePillTextActive: { color: '#05C925' },
  navRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 20 },
  backButton: { width: 55, height: 55, borderRadius: 15, borderWidth: 1, borderColor: '#05C925', alignItems: 'center', justifyContent: 'center' },
  backButtonOutline: { flex: 1, height: 55, borderRadius: 15, borderWidth: 1, borderColor: '#05C925', alignItems: 'center', justifyContent: 'center' },
  forwardButton: { backgroundColor: '#05C925', height: 55, paddingHorizontal: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flex: 1 },
  forwardText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  // Step 3 specific
  imageUploadPlaceholder: { width: 200, height: 200, backgroundColor: '#F8F8F8', borderRadius: 40, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 40, marginTop: 20, borderWidth: 1, borderColor: '#EEE', overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%' },
  coverLabel: { color: '#777', fontWeight: '700', textAlign: 'center', marginTop: -30, marginBottom: 22 },
  addIconSmall: { position: 'absolute', bottom: 65, right: 65, backgroundColor: '#CCC', borderRadius: 6, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' },
  inputField: { borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 16, color: '#444' },
});
