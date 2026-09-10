import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function NoteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notebooks, updateNotebook } = useApp();
  const note = notebooks.find((item) => item.id === id);
  const [title, setTitle] = useState(note?.title ?? 'Untitled note');
  const [body, setBody] = useState(note?.body ?? '');
  if (!note) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.foreground }}>Note unavailable</Text></View>;
  const save = () => {
    updateNotebook({ ...note, title: title.trim() || 'Untitled note', body, updatedAt: Date.now() });
    router.back();
  };
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}><Pressable onPress={() => router.back()} style={styles.icon}><Feather name="arrow-left" size={21} color={colors.foreground} /></Pressable><Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit note</Text><Pressable onPress={save} accessibilityLabel="Save note" style={[styles.save, { backgroundColor: colors.primary }]}><Text style={[styles.saveText, { color: colors.primaryForeground }]}>Save</Text></Pressable></View>
      <View style={styles.editor}><TextInput value={title} onChangeText={setTitle} placeholder="Note title" placeholderTextColor={colors.mutedForeground} style={[styles.title, { color: colors.foreground, borderBottomColor: colors.border }]} /><TextInput value={body} onChangeText={setBody} placeholder="Start writing…" placeholderTextColor={colors.mutedForeground} multiline textAlignVertical="top" style={[styles.body, { color: colors.foreground }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { minHeight: 66, paddingHorizontal: 16, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  save: { paddingHorizontal: 15, minHeight: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  editor: { flex: 1, padding: 24, gap: 18 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, paddingVertical: 11, borderBottomWidth: 1 },
  body: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 27 },
});