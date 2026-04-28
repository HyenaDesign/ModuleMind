import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  SafeAreaView, Image, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import CustomTabBar from '../components/CustomTabBar';

export default function CreateModuleScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isProcessing, setIsProcessing] = useState(false);

  const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",                                          // PDF
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword",                                       // .doc
        "text/plain",                                               // .txt
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFile(result);
      console.log("File selected:", result.assets[0].name);
    }
  } catch (err) {
    Alert.alert("Fout", "Kon bestand niet laden.");
  }
};
const handleGenerateAI = async () => {
  if (!file || !file.assets || file.assets.length === 0) {
    Alert.alert("Wacht even", "Upload eerst een bestand.");
    return;
  }

  setIsProcessing(true);
  
  try {
    const selectedFile = file.assets[0];
    const formData = new FormData();

    // WEB FIX: Fetch the file URI and convert it to a Blob
    const responseFile = await fetch(selectedFile.uri);
    const blob = await responseFile.blob();

    // Append the actual binary blob
    formData.append('file', blob, selectedFile.name);
    formData.append('model', selectedModel);

    const response = await fetch('http://192.168.0.254:3000/generate-quiz', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // DO NOT set Content-Type header; let the browser/app set the boundary automatically
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ AI Questions:", data);
      Alert.alert("Succes", "Check de console voor de vragen!");
    } else {
      console.error("❌ Server Error:", data.message);
      Alert.alert("Fout", data.message);
    }
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    Alert.alert("Netwerkfout", "Kan de server niet bereiken.");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Module maken</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>1. Upload bestanden</Text>
            <TouchableOpacity 
              style={[styles.uploadBox, file ? styles.uploadBoxActive : null]} 
              onPress={pickDocument}
            >
              <View style={styles.folderShape}>
                <Text style={[styles.uploadTitle, file ? {color: '#05C925'} : null]}>
                  {file ? "Bestand geladen!" : "Klik om te uploaden"}
                </Text>
                <Text style={styles.uploadSubtitle}>
                  {file?.assets?.[0]?.name ?? "PDF, DOCX of TXT"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>2. Kies AI Model</Text>
            <TouchableOpacity 
              style={[styles.modelCard, selectedModel === 'gpt-4o' && styles.selectedModelCard]}
              onPress={() => setSelectedModel('gpt-4o')}
            >
              <View>
                <Text style={styles.modelName}>OpenAI GPT-4o</Text>
                <Text style={styles.modelDesc}>Meest accuraat voor complexe stof</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modelCard, selectedModel === 'gpt-3.5' && styles.selectedModelCard]}
              onPress={() => setSelectedModel('gpt-3.5')}
            >
              <View>
                <Text style={styles.modelName}>GPT-3.5 Turbo</Text>
                <Text style={styles.modelDesc}>Sneller voor simpele samenvattingen</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleGenerateAI}
            disabled={isProcessing}
          >
            {isProcessing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.continueButtonText}>Genereer Vragen</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <CustomTabBar activeTab="Modules" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 30, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#05C925', marginBottom: 30, marginTop: 20 },
  section: { marginBottom: 35 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', color: '#05C925', marginBottom: 15 },
  uploadBox: {
    width: '100%', height: 180, borderWidth: 2, borderColor: '#EEE', 
    borderStyle: 'dashed', borderRadius: 25, justifyContent: 'center', alignItems: 'center',
  },
  uploadBoxActive: { borderColor: '#05C925', backgroundColor: '#F0FFF4', borderStyle: 'solid' },
  folderShape: { alignItems: 'center', justifyContent: 'center' }, // Added to fix your error
  uploadTitle: { fontSize: 18, fontWeight: 'bold', color: '#AAA', marginBottom: 5 },
  uploadSubtitle: { fontSize: 13, color: '#AAA' },
  modelCard: {
    padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#EEE', marginBottom: 10, backgroundColor: '#FFF'
  },
  selectedModelCard: { borderColor: '#05C925', backgroundColor: '#F0FFF4' },
  modelName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  modelDesc: { fontSize: 12, color: '#999' },
  continueButton: { 
    backgroundColor: '#05C925', paddingVertical: 18, borderRadius: 15, alignItems: 'center' 
  },
  continueButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});