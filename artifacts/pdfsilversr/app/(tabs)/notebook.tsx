import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { SectionTitle } from '@/components/SectionTitle';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function NotebookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notebooks, addNotebook } = useApp();
  const openNew = () => {
    const note = addNotebook();
    router.push({ pathname: '/note', params: { id: note.id } });
  };
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 14 }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}><AppIcon size={38} /><View><Text style={[styles.eyebrow, { color: colors.primary }]}>NOTEBOOK</Text><Text style={[styles.title, { color: colors.foreground }]}>A page for ideas</Text></View></View>
          <Pressable accessibilityLabel="Create note" onPress={openNew} style={({ pressed }) => [styles.add, { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}><Feather name="plus" size={21} color={colors.primaryForeground} /></Pressable>
        </View>
        <View style={[styles.intro, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="feather" size={23} color={colors.primary} />
          <Text style={[styles.introText, { color: colors.secondaryForeground }]}>Keep reading notes and unfinished thoughts next to your documents. This space is private and offline.</Text>
        </View>
        <SectionTitle title={`${notebooks.length} ${notebooks.length === 1 ? 'note' : 'notes'}`} />
        <View style={styles.list}>
          {notebooks.map((note) => (
            <Pressable key={note.id} onPress={() => router.push({ pathname: '/note', params: { id: note.id } })} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
              <View style={[styles.noteIcon, { backgroundColor: '#E9E6DC' }]}><Feather name="edit-3" size={18} color="#876E42" /></View>
              <View style={styles.copy}><Text numberOfLines={1} style={[styles.noteTitle, { color: colors.foreground }]}>{note.title || 'Untitled note'}</Text><Text numberOfLines={2} style={[styles.preview, { color: colors.mutedForeground }]}>{note.body || 'Empty page'}</Text></View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  eyebrow: { fontFamily: 'Inter_700Bold', letterSpacing: 1.7, fontSize: 10, marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.4 },
  add: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  intro: { borderWidth: 1, borderRadius: 18, padding: 17, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  introText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
  list: { gap: 10 },
  card: { minHeight: 80, borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  noteIcon: { width: 46, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 },
  noteTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  preview: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
});