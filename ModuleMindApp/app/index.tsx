import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <ImageBackground
    source={require('../assets/images/background.jpg')}
    style={styles.backgroundImage}
    resizeMode="cover"
    >
    {/* Dark overlay */}
    <View style={styles.overlay} />

    {/* Content */}
    <View style={styles.content}>
        <Text style={styles.title}>Welkom!</Text>

        <View style={styles.buttonContainer}>
  <Pressable
    style={styles.signIn}
    onPress={() => router.push('/signin')}
  >
    <Text style={styles.signInText}>Sign In</Text>
  </Pressable>

  <Pressable
    style={styles.signUp}
    onPress={() => router.push('/signup')}
  >
    <Text style={styles.signUpText}>Sign Up</Text>
  </Pressable>
</View>
    </View>
    </ImageBackground>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // dark background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    color: '#05C925',
    fontWeight: 'bold',
    marginBottom: 60,
  },
  buttonContainer: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: 100,
  justifyContent: 'center',
},
signIn: {
    position: 'absolute',
    left: 45,
    bottom: 35,
},

signUp: {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: 190,
  height: 100,
  backgroundColor: '#3ADB5A',
  justifyContent: 'center',
  alignItems: 'center',
  borderTopLeftRadius: 55,
},

signInText: {
  color: '#05C925',
  fontSize: 24,
  fontWeight: '600',
},

signUpText: {
  color: 'white',
  fontSize: 24,
  fontWeight: '600',
},
  backgroundImage: {
  flex: 1,
  width: '100%',
  height: '100%',
  },

  overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
},

content: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
 },
});