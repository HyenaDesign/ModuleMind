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
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SignInScreen() {
  const navigation = useNavigation<any>();

  // --- 1. State for Inputs ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- 2. Login Logic ---
  const handleSignIn = async () => {
    console.log("Attempting login...");
    if (!email || !password) {
      console.log("Validation failed");
      Alert.alert("Fout", "Vul alstublieft uw email en wachtwoord in.");
      return;
    }

    setLoading(true);

    try {
      // REPLACE YOUR_IP with the same IP used in your SignUp
      const response = await fetch('https://modulemindapi-production.up.railway.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // SUCCESS: Navigate to your tab navigator
        // Using 'replace' ensures the user can't "go back" to the login screen
        navigation.replace('(tabs)'); 
      } else {
        Alert.alert("Login mislukt", data.message || "Ongeldige inloggegevens.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Netwerkfout", "Kan geen verbinding maken met de server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#555" />
            <Text style={styles.backText}>Terug</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.card}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Welkom terug</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Example@email.com" 
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Wachtwoord</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="........" 
                  secureTextEntry 
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Onthoud mij</Text>
                </TouchableOpacity>
                
                <TouchableOpacity>
                  <Text style={styles.linkText}>Wachtwoord vergeten?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.signInButton} 
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signInButtonText}>Sign in</Text>}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OF</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialCircle}><FontAwesome name="facebook" size={30} color="#1877F2" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}><AntDesign name="twitter" size={26} color="black" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}><AntDesign name="google" size={28} color="#DB4437" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}><AntDesign name="windows" size={28} color="#00A1F1" /></TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.footerText}>
                  Nog geen account? <Text style={styles.linkText}>Sign up</Text>
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  signInButton: {
    backgroundColor: '#00C853',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signInButtonText: {
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