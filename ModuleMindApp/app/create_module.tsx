import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Alert, ScrollView, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabBar from '../components/CustomTabBar';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
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

      return {
        question: asString(record.question || record.title || record.prompt),
        options,
        correctAnswer: asString(record.correctAnswer || record.correct_answer || record.answer),
      };
    })
    .filter((question) => question.question && question.options.length > 0 && question.correctAnswer);
};

export default function CreateModuleScreen() {
  const router = useRouter();
  const { subjectId, subjectTitle } = useLocalSearchParams();
  const selectedSubjectId = Array.isArray(subjectId) ? subjectId[0] : subjectId;
  const selectedSubjectTitle = Array.isArray(subjectTitle) ? subjectTitle[0] : subjectTitle;

  // Navigation & Loading State
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Finalize
  const [isProcessing, setIsProcessing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data State
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Step 3 Metadata State (afbeelding_7.png)
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

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
      Alert.alert("Fout", "Kon bestand niet laden.");
    }
  };

  // --- STEP 1 LOGIC: GENERATE AI ---
  const handleGenerateAI = async () => {
    if (!file || !file.assets) return;
    setIsProcessing(true);
    
    try {
      const selectedFile = file.assets[0];
      const formData = new FormData();
      const responseFile = await fetch(selectedFile.uri);
      const blob = await responseFile.blob();

      formData.append('file', blob, selectedFile.name);
      formData.append('model', selectedModel);

      const response = await fetch('https://modulemindapi-production.up.railway.app/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.questions) {
        const normalizedQuestions = normalizeQuestions(data.questions);

        if (normalizedQuestions.length === 0) {
          Alert.alert("Fout", "De gegenereerde vragen hebben geen geldig formaat.");
          return;
        }

        setQuestions(normalizedQuestions);
        setStep(2);
      } else {
        Alert.alert("Fout", data.message || "Genereren mislukt.");
      }
    } catch {
      Alert.alert("Netwerkfout", "Kan server niet bereiken.");
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
    if (currentQ.options[index] === currentQ.correctAnswer) {
      currentQ.correctAnswer = text;
    }
    currentQ.options[index] = text;
    setQuestions(newQuestions);
  };

  const toggleCorrectAnswer = (optionText: string) => {
    const newQuestions = [...questions];
    newQuestions[currentIndex].correctAnswer = optionText;
    setQuestions(newQuestions);
  };

  // --- STEP 3 LOGIC: SAVE TO DB ---
  const handleSaveModule = async () => {
    if (!moduleTitle.trim()) {
      Alert.alert("Oeps", "Geef je module eerst een titel.");
      return;
    }
    const subjectIdNumber = Number(selectedSubjectId);
    if (!selectedSubjectId || Number.isNaN(subjectIdNumber)) {
      Alert.alert("Fout", "Open eerst een vak voordat je een module maakt.");
      router.replace('/(tabs)/Home');
      return;
    }

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
          questions,
          subjectTitle: selectedSubjectTitle,
        };

        await AsyncStorage.setItem(
          `moduleQuestions:${subjectIdNumber}:${moduleTitle.trim().toLowerCase()}`,
          JSON.stringify(cachedModule)
        );

        if (savedModuleId) {
          await AsyncStorage.setItem(`moduleQuestionsById:${savedModuleId}`, JSON.stringify(cachedModule));
        }

        Alert.alert("Succes", "Je module is opgeslagen!");
        router.back();
      }
    } catch {
      Alert.alert("Fout", "Kon module niet opslaan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* --- STEP 1: UPLOAD --- */}
          {step === 1 && (
            <>
              <Text style={styles.title}>{selectedSubjectTitle ? `Module maken voor ${selectedSubjectTitle}` : "Module maken"}</Text>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>1. Upload bestanden</Text>
                <TouchableOpacity 
                  style={[styles.uploadBox, file ? styles.uploadBoxActive : null]} 
                  onPress={pickDocument}
                >
                  <Text style={[styles.uploadTitle, file ? {color: '#05C925'} : null]}>
                    {file ? "Bestand geladen!" : "Klik om te uploaden"}
                  </Text>
                  <Text style={styles.uploadSubtitle}>{file?.assets?.[0]?.name ?? "PDF, DOCX of TXT"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>2. Kies AI Model</Text>
                {['gpt-4o', 'gpt-3.5'].map((m) => (
                  <TouchableOpacity 
                    key={m}
                    style={[styles.modelCard, selectedModel === m && styles.selectedModelCard]}
                    onPress={() => setSelectedModel(m)}
                  >
                    <Text style={styles.modelName}>{m === 'gpt-4o' ? 'OpenAI GPT-4o' : 'GPT-3.5 Turbo'}</Text>
                    <Text style={styles.modelDesc}>{m === 'gpt-4o' ? 'Meest accuraat' : 'Sneller'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateAI} disabled={isProcessing}>
                {isProcessing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Genereer Vragen</Text>}
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
                {questions[currentIndex].options.map((opt, i) => {
  const optStr = String(opt || "");
  const correctStr = String(questions[currentIndex].correctAnswer || "");

  const isCorrect = optStr.trim().toLowerCase() === correctStr.trim().toLowerCase();

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
                  <Text style={styles.forwardText}>{currentIndex === questions.length - 1 ? "Afronden" : "Doorgaan"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* --- STEP 3: FINALIZE (afbeelding_7.png) --- */}
          {step === 3 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.title}>{selectedSubjectTitle ? `Module maken voor ${selectedSubjectTitle}` : "Module maken"}</Text>

              <View style={styles.imageUploadPlaceholder}>
                <Ionicons name="image-outline" size={50} color="#CCC" />
                <View style={styles.addIconSmall}>
                  <Ionicons name="add" size={16} color="#FFF" />
                </View>
              </View>

              <TextInput
                style={styles.inputField}
                placeholder="Titel invoeren..."
                value={moduleTitle}
                onChangeText={setModuleTitle}
              />

              <TextInput
                style={[styles.inputField, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Beschrijving (optioneel)"
                multiline
                value={moduleDesc}
                onChangeText={setModuleDesc}
              />

              <View style={styles.navRow}>
                <TouchableOpacity style={styles.backButtonOutline} onPress={() => setStep(2)}>
                  <Text style={{ color: '#05C925', fontWeight: '700' }}>Verder bewerken</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forwardButton} onPress={handleSaveModule} disabled={saving}>
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.forwardText}>Doorgaan</Text>}
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
  navRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 20 },
  backButton: { width: 55, height: 55, borderRadius: 15, borderWidth: 1, borderColor: '#05C925', alignItems: 'center', justifyContent: 'center' },
  backButtonOutline: { flex: 1, height: 55, borderRadius: 15, borderWidth: 1, borderColor: '#05C925', alignItems: 'center', justifyContent: 'center' },
  forwardButton: { backgroundColor: '#05C925', height: 55, paddingHorizontal: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flex: 1 },
  forwardText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  // Step 3 specific
  imageUploadPlaceholder: { width: 200, height: 200, backgroundColor: '#F8F8F8', borderRadius: 40, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 40, marginTop: 20, borderWidth: 1, borderColor: '#EEE' },
  addIconSmall: { position: 'absolute', bottom: 65, right: 65, backgroundColor: '#CCC', borderRadius: 6, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' },
  inputField: { borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 16, color: '#444' },
});
