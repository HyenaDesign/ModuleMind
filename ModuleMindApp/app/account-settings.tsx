import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';
import AppMessage from '../components/AppMessage';
import { getStoredUser, saveStoredUser } from '../constants/account';
import { getStoredLanguage, LanguageKey, translate } from '../constants/language';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageKey>('nl');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; tone: 'error' | 'warning' | 'success' } | null>(null);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const loadAccount = useCallback(async () => {
    try {
      setLoading(true);
      setLanguage(await getStoredLanguage());
      const user = await getStoredUser();

      if (!user) {
        router.replace('/signin');
        return;
      }

      setName(user.name || user.full_name || '');
      setEmail(user.email || '');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadAccount();
    }, [loadAccount])
  );

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setMessage({ text: t('requiredFields'), tone: 'warning' });
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setMessage({ text: t('passwordTooShort'), tone: 'warning' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ text: t('passwordMismatch'), tone: 'warning' });
        return;
      }
    }

    setSaving(true);
    setMessage(null);
    try {
      await saveStoredUser({
        name: name.trim(),
        full_name: name.trim(),
        email: email.trim(),
        ...(newPassword ? { passwordUpdatedAt: new Date().toISOString() } : {}),
      });
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ text: t('accountSaved'), tone: 'success' });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const handleClearLocalData = async () => {
    const user = await getStoredUser();
    const userId = String(user?.id || user?.user_id || 'guest');
    const keys = await AsyncStorage.getAllKeys();
    const moduleKeys = keys.filter((key) => key.startsWith('moduleQuestions') || key === `quizScores:${userId}`);
    await AsyncStorage.multiRemove(moduleKeys);
    setMessage({ text: t('localDataCleared'), tone: 'success' });
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
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#05C925" />
            </TouchableOpacity>
            <Text style={styles.title}>{t('accountSettings')}</Text>
          </View>

          {message && <AppMessage tone={message.tone} message={message.text} />}

          <View style={styles.card}>
            <Text style={styles.label}>{t('name')}</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t('name')} />

            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.divider} />

            <Text style={styles.label}>{t('newPassword')}</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('newPassword')}
              secureTextEntry
            />

            <Text style={styles.label}>{t('confirmPassword')}</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('confirmPassword')}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>{t('save')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineButton} onPress={handleClearLocalData}>
            <Ionicons name="trash-outline" size={20} color="#FF5F5F" />
            <Text style={styles.outlineButtonText}>{t('clearLocalData')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <CustomTabBar activeTab="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  content: { padding: 24, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#05C925',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, color: '#05C925', fontSize: 26, fontWeight: '800' },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#FFF',
    padding: 18,
  },
  label: { color: '#555', fontWeight: '700', marginBottom: 8, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 14,
    color: '#333',
    backgroundColor: '#FFF',
  },
  divider: { height: 1, backgroundColor: '#E6E6E6', marginVertical: 18 },
  primaryButton: {
    marginTop: 18,
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: '#05C925',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  outlineButton: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5F5F',
    backgroundColor: '#FFF3F3',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  outlineButtonText: { color: '#FF5F5F', fontWeight: '700' },
});
