import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image,
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppMessage from '../components/AppMessage';
import CustomTabBar from '../components/CustomTabBar';
import { useLanguage } from '../hooks/use-language';

export default function CreateSubjectScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  // State for inputs
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [coverImage, setCoverImage] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage(t('fileLoadFailed'));
    }
  };

  // Function to save to MAMP Backend
  const handleSave = async () => {
    if (!subjectTitle.trim()) {
      setMessage(t('moduleTitleRequired'));
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        setMessage(t('somethingWentWrong'));
        router.replace('/signin');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id || user.user_id;
      if (!userId) {
        setMessage(t('somethingWentWrong'));
        router.replace('/signin');
        return;
      }

      // replace the IP with your local machine IP
      const response = await fetch('https://modulemindapi-production.up.railway.app/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          title: subjectTitle,
          description: subjectDescription,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const subjectId = data.id || data.subject_id || data.subjectId || data.subject?.id || Date.now();
        const localSubject = {
          id: subjectId,
          user_id: userId,
          title: subjectTitle.trim(),
          description: subjectDescription.trim() || null,
          cover_image: coverImage?.uri || null,
          icon: coverImage?.uri || null,
        };
        const localSubjectsKey = `localSubjects:${userId}`;
        const storedLocalSubjects = await AsyncStorage.getItem(localSubjectsKey);
        const localSubjects = storedLocalSubjects ? JSON.parse(storedLocalSubjects) : [];
        const nextLocalSubjects = [
          localSubject,
          ...localSubjects.filter((subject: { id: number }) => subject.id !== subjectId),
        ];
        await AsyncStorage.setItem(localSubjectsKey, JSON.stringify(nextLocalSubjects));
        if (coverImage?.uri && subjectId) {
          await AsyncStorage.setItem(`subjectCover:${subjectId}`, coverImage.uri);
        }
        router.back(); 
      } else {
        setMessage(data.message || t('somethingWentWrong'));
      }
    } catch {
      setMessage(t('noInternet'));
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
          <Text style={styles.mainTitle}>{t('createSubject')}</Text>

          {message && <AppMessage tone="warning" title={t('internetWarning')} message={message} />}

          {/* Image Uploader Placeholder */}
          <View style={styles.imageUploaderContainer}>
            <TouchableOpacity style={styles.imageBox} activeOpacity={0.8} onPress={pickCoverImage}>
              {coverImage?.uri ? (
                <Image source={{ uri: coverImage.uri }} style={styles.coverImage} />
              ) : (
                <Ionicons name="image-outline" size={60} color="#AAA" />
              )}
              <Ionicons name="add" size={24} color="#555" style={styles.uploadPlus} />
            </TouchableOpacity>
            <Text style={styles.coverLabel}>{coverImage ? t('coverLoaded') : t('uploadCover')}</Text>
          </View>

          {/* Input: Title */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder={t('enterTitle')}
              value={subjectTitle}
              onChangeText={setSubjectTitle}
              placeholderTextColor="#AAA"
            />
          </View>

          {/* Input: Description */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder={t('descriptionOptional')}
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
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>{t('save')}</Text>
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
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverLabel: {
    marginTop: 10,
    color: '#777',
    fontWeight: '700',
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

