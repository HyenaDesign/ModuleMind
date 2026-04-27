import React from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WhiteHeaderPage() {
  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* 1. The White Overlay (0.6 opacity) that covers the whole image */}
      <View style={styles.whiteOverlay} />

      {/* 2. The Gradient that creates the 75% solid white look */}
      <LinearGradient
        // We use white for the first two to create a solid block
        colors={['white', 'white', 'transparent']}
        // 0 to 0.75 is solid white. From 0.75 to 1 it fades to show the image.
        locations={[0, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.header}>
        <Text style={styles.headerText}>Vakken</Text>
        <Text style={styles.headerIcon}>+</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>Nog geen vakken</Text> 
      </View>

      <SafeAreaView style={styles.container}>
        {/* Your content here will sit on the white part */}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Your 0.6 opacity overlay
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#05C925',
  },
  headerIcon: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#05C925',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  contentText: {
    fontSize: 18,
    color: '#333',
  },
});