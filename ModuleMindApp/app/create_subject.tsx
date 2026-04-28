import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomTabBar from '../components/CustomTabBar';

export default function CreateSubjectScreen() {
  const router = useRouter();
  
  // State for inputs
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to save to MAMP Backend
  const handleSave = async () => {
    if (!subjectTitle.trim()) {
      Alert.alert("Fout", "Voer a.u.b. een titel in voor het vak.");
      return;
    }

    setLoading(true);

    try {
      // replace the IP with your local machine IP
      const response = await fetch('http://192.168.0.254:3000/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Placeholder: replace with real user ID later
          title: subjectTitle,
          description: subjectDescription,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Go back to the Home screen
        router.back(); 
      } else {
        Alert.alert("Fout", data.message || "Kon vak niet opslaan.");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Netwerkfout", "Kan geen verbinding maken met de server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Header Title */}
          <Text style={styles.mainTitle}>Vak aanmaken</Text>

          {/* Image Uploader Placeholder */}
          <View style={styles.imageUploaderContainer}>
            <TouchableOpacity style={styles.imageBox} activeOpacity={0.8}>
              <Ionicons name="image-outline" size={60} color="#AAA" />
              <Ionicons name="add" size={24} color="#555" style={styles.uploadPlus} />
            </TouchableOpacity>
          </View>

          {/* Input: Title */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Titel invoeren..."
              value={subjectTitle}
              onChangeText={setSubjectTitle}
              placeholderTextColor="#AAA"
            />
          </View>

          {/* Input: Description */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Beschrijving (optioneel)"
              value={subjectDescription}
              onChangeText={setSubjectDescription}
              placeholderTextColor="#AAA"
            />
          </View>

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annuleer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Opslaan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <CustomTabBar activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#05C925',
    marginBottom: 20,
  },
  imageUploaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  imageBox: {
    width: 180,
    height: 180,
    backgroundColor: '#F7F7F7',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  uploadPlus: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    width: '47%',
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#05C925',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#05C925',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    width: '47%',
    paddingVertical: 16,
    backgroundColor: '#05C925',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});