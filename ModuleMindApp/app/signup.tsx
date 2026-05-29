import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppMessage from '../components/AppMessage';
import { useLanguage } from '../hooks/use-language';

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [agree, setAgree] = useState(false);
  
  // 1. ADD THESE STATES
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 2. ADD THIS FUNCTION
  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      setMessage(t('requiredFields'));
      return;
    }
    if (!agree) {
      setMessage(t('acceptTerms'));
      return;
    }

    setLoading(true);
    setMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('https://modulemindapi-production.up.railway.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.status === 201) {
        setSuccessMessage(t('saved'));
        router.push('/signin');
      } else {
        setMessage(data.message || t('somethingWentWrong'));
      }
    } catch {
      setMessage(t('noInternet'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')} // Ensure path is correct
      style={styles.background}
      resizeMode="cover"
    >
        {/* Dark overlay */}
        <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#555" />
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Main White Card */}
          <View style={styles.card}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              <Text style={styles.title}>{t('getStarted')}</Text>

              {message && <AppMessage tone="warning" title={t('internetWarning')} message={message} />}
              {successMessage && <AppMessage tone="success" message={successMessage} />}

              {/* Form Fields - Compact spacing */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('fullName')}</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="John Doe" 
                  placeholderTextColor="#BBB"
                  value={fullName} onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email')}</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Example@email.com" 
                  placeholderTextColor="#BBB"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email} onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('password')}</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="........" 
                  placeholderTextColor="#BBB"
                  secureTextEntry 
                  value={password} onChangeText={setPassword}
                />
              </View>

              {/* Checkbox Section */}
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setAgree(!agree)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agree && styles.checkedBox]}>
                  {agree && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  {t('acceptTerms')}
                </Text>
              </TouchableOpacity>

              {/* Action Button */}
              <TouchableOpacity 
                style={[styles.signUpButton, loading && { opacity: 0.7 }]} 
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
                >
                <Text style={styles.signUpButtonText}>
                    {loading ? "..." : t('signUp')}
                </Text>
                </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OF</Text>
                <View style={styles.line} />
              </View>

              {/* Social Login Row */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialCircle}><FontAwesome name="facebook" size={30} color="#1877F2" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}><AntDesign name="twitter" size={26} color="black" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}><AntDesign name="google" size={28} color="#DB4437" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}><AntDesign name="windows" size={28} color="#00A1F1" /></TouchableOpacity>
              </View>

              {/* Switch to Login */}
              <TouchableOpacity style={styles.footer} onPress={() => router.push('/signin')}>
                <Text style={styles.footerText}>
                    {t('hasAccount')} <Text style={styles.linkText}>{t('signIn')}</Text>
                </Text>
                </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
   overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  backText: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 120, // Adjust this to push the card lower or higher
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: 35,
    paddingTop: 35,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00C853',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 14, // Tight spacing
  },
  label: {
    fontSize: 16,
    color: '#777777',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#777777',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#00C853',
    borderColor: '#00C853',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#777',
  },
  linkText: {
    color: '#00C853',
    fontWeight: '700',
  },
  signUpButton: {
    backgroundColor: '#00C853',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#AAA',
    fontWeight: '600',
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  socialCircle: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 10,
  },
  footerText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
  },
});
