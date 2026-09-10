import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/ActionButton';
import { AppIcon } from '@/components/AppIcon';
import { DocumentCard } from '@/components/DocumentCard';
import { SectionTitle } from '@/components/SectionTitle';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { documents, importPdf, importImagesAsPdf, isReady } = useApp();
  if (!isReady) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 14 }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <AppIcon />
            <View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>PDFSILVERSR</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>Your library</Text>
            </View>
          </View>
          <Pressable accessibilityLabel="Open settings" onPress={() => router.push('/settings')} style={({ pressed }) => [styles.settings, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
            <Feather name="sliders" size={19} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={[styles.hero, { backgroundColor: colors.navy }]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>LOCAL DOCUMENTS</Text>
            <Text style={styles.heroTitle}>Read with focus.</Text>
            <Text style={styles.heroText}>Your PDFs and notes stay on this device, ready when you are.</Text>
          </View>
          <Feather name="layers" size={68} color={colors.silver} style={styles.heroIcon} />
        </View>
        <View style={styles.actions}>
          <ActionButton icon="file-plus" label="Import PDF" tone="primary" onPress={importPdf} />
          <ActionButton icon="image" label="From images" onPress={importImagesAsPdf} />
        </View>
        <SectionTitle title="Recent documents" />
        {documents.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}><Feather name="archive" size={23} color={colors.accentForeground} /></View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your shelf is clear</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Import a PDF or build one from images to start your offline library.</Text>
          </View>
        ) : (
          <View style={styles.list}>{documents.slice(0, 6).map((document) => <DocumentCard key={document.id} document={document} onPress={() => router.push({ pathname: '/reader', params: { id: document.id } })} />)}</View>
        )}
        <Pressable onPress={() => router.push('/notebook')} style={({ pressed }) => [styles.notebookLink, { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}>
          <View style={[styles.notebookIcon, { backgroundColor: '#E9E6DC' }]}><Feather name="edit-3" size={19} color="#876E42" /></View>
          <View style={styles.copy}><Text style={[styles.notebookTitle, { color: colors.foreground }]}>Need a blank page?</Text><Text style={[styles.notebookText, { color: colors.mutedForeground }]}>Open your notebook workspace</Text></View>
          <Feather name="arrow-up-right" size={18} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 22 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.7, marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -0.5 },
  settings: { width: 43, height: 43, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 22, minHeight: 164, overflow: 'hidden', padding: 22, justifyContent: 'center' },
  heroCopy: { maxWidth: '76%', gap: 8 },
  heroKicker: { color: '#D79A5B', fontFamily: 'Inter_700Bold', letterSpacing: 1.5, fontSize: 10 },
  heroTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.5 },
  heroText: { color: '#B7C2D0', fontFamily: 'Inter_400Regular', lineHeight: 19, fontSize: 13 },
  heroIcon: { position: 'absolute', right: 19, bottom: 19, opacity: 0.62 },
  actions: { flexDirection: 'row', gap: 10 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 23, alignItems: 'center', gap: 9 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 270 },
  list: { gap: 10 },
  notebookLink: { borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  notebookIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 3 },
  notebookTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  notebookText: { fontFamily: 'Inter_400Regular', fontSize: 12 },
});
