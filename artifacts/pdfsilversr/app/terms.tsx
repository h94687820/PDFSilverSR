import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export default function TermsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}><View style={[styles.header, { borderBottomColor: colors.border }]}><Pressable onPress={() => router.back()} style={styles.icon}><Feather name="arrow-left" size={21} color={colors.foreground} /></Pressable><Text style={[styles.headerTitle, { color: colors.foreground }]}>Terms & conditions</Text></View><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}><Text style={[styles.title, { color: colors.foreground }]}>PDFSilverSR terms</Text><Text style={[styles.updated, { color: colors.mutedForeground }]}>Last updated September 2026</Text><Text style={[styles.heading, { color: colors.foreground }]}>Local-first processing</Text><Text style={[styles.body, { color: colors.secondaryForeground }]}>PDFSilverSR is designed to work without an account or internet connection. Imported documents and notebook content remain on your device. The application does not upload, analyze, or share document content with a remote service.</Text><Text style={[styles.heading, { color: colors.foreground }]}>Your files</Text><Text style={[styles.body, { color: colors.secondaryForeground }]}>You choose which files to open using the operating system file picker. PDFSilverSR stores a local copy so you can continue working offline. You can remove locally stored app data at any time from Settings.</Text><Text style={[styles.heading, { color: colors.foreground }]}>Limitations</Text><Text style={[styles.body, { color: colors.secondaryForeground }]}>You are responsible for keeping your own backups of important files. PDFSilverSR does not replace your device backup system or guarantee recovery after app data is deleted.</Text></ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { minHeight: 66, paddingHorizontal: 16, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  content: { padding: 24, gap: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 25, marginBottom: -4 },
  updated: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 13 },
  heading: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 6 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22 },
});