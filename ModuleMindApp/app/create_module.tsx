import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';

export default function CreateModuleScreen() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams(); // To link the module to the subject
  const [selectedModel, setSelectedModel] = useState('GPT-4o');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Module maken</Text>

        {/* 1. Upload Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.uploadBox}>
            <View style={styles.folderShape}>
               <Text style={styles.uploadTitle}>1. Upload files</Text>
               <Text style={styles.uploadSubtitle}>Tik hier om een file op te laden.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. Choose Model Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>2. Kies model</Text>
          <View style={styles.modelCard}>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg' }} 
              style={styles.modelIcon} 
            />
            <View>
              <Text style={styles.modelName}>OpenAI ChatGPT</Text>
              <Text style={styles.modelVersion}>5.2</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Annuleer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => {
              // Logic to save module to DB would go here
              console.log("Creating module for subject:", subjectId);
              router.back();
            }}
          >
            <Text style={styles.continueButtonText}>Doorgaan</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CustomTabBar activeTab="Modules" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 30,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#05C925',
    marginBottom: 40,
    marginTop: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#05C925',
    marginBottom: 20,
  },
  uploadBox: {
    width: '100%',
    height: 250,
    borderWidth: 2,
    borderColor: '#05C925',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
  },
  folderShape: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#05C925',
    marginBottom: 10,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  modelIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    resizeMode: 'contain'
  },
  modelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modelVersion: {
    fontSize: 12,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#05C925',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#05C925',
    fontWeight: 'bold',
    fontSize: 16,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#05C925',
    paddingVertical: 15,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});