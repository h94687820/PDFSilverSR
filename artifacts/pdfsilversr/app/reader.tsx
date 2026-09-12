import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Pdf, { type PdfRef } from 'react-native-pdf';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import type { DocumentRecord, PageRecord } from '@/types/library';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function ReaderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { documents, updateDocument, appendImagesToDocument, settings, setZoomLocked } = useApp();
  const document = documents.find((item) => item.id === id);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(0);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfRef = useRef<PdfRef>(null);

  const visiblePages = useMemo(() => {
    if (!document) return [];
    const start = Math.max(0, pageIndex - 5);
    const end = Math.min(document.pages.length, pageIndex + 6);
    return document.pages.slice(start, end).map((page, index) => ({ page, index: start + index }));
  }, [document, pageIndex]);

  const isPdfDocument = document?.mimeType === 'application/pdf' && document.pages.some((page) => page.kind === 'pdf');
  const totalPages = isPdfDocument ? pdfPageCount ?? document?.pages.length ?? 1 : document?.pages.length ?? 1;

  const goToPage = (nextIndex: number) => {
    if (!document) return;
    const next = clamp(nextIndex, 0, totalPages - 1);
    setPageIndex(next);
    if (isPdfDocument) {
      pdfRef.current?.setPage(next + 1);
    }
    const now = Date.now();
    updateDocument({ ...document, lastOpenedAt: now });
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -45 || gesture.vx < -0.5) goToPage(pageIndex + 1);
      if (gesture.dx > 45 || gesture.vx > 0.5) goToPage(pageIndex - 1);
    },
  })).current;

  if (!document) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.notFound, { color: colors.foreground }]}>Document unavailable</Text><Pressable onPress={() => router.back()}><Text style={{ color: colors.primary }}>Go back</Text></Pressable></View>;
  }

  const currentPage = document.pages[pageIndex];
  const handlePdfLoad = (numberOfPages: number) => {
    setPdfError(null);
    setPdfPageCount(numberOfPages);
    if (document.pages.length !== numberOfPages || document.pages.some((page) => page.kind !== 'pdf')) {
      updateDocument({
        ...document,
        pages: Array.from({ length: numberOfPages }, (_, index) => ({
          id: `${document.id}-page-${index + 1}`,
          kind: 'pdf' as const,
        })),
        lastOpenedAt: Date.now(),
      });
    }
  };
  const handlePdfPageChanged = (page: number, numberOfPages: number) => {
    setPdfPageCount(numberOfPages);
    setPageIndex(clamp(page - 1, 0, numberOfPages - 1));
  };
  const movePage = (direction: -1 | 1) => {
    const target = selectedPage + direction;
    if (target < 0 || target >= document.pages.length) return;
    const pages = [...document.pages];
    [pages[selectedPage], pages[target]] = [pages[target], pages[selectedPage]];
    updateDocument({ ...document, pages });
    setSelectedPage(target);
    if (pageIndex === selectedPage) setPageIndex(target);
  };
  const addPage = () => {
    const pages = [...document.pages, { id: `page-${Date.now()}`, kind: 'blank' as const }];
    updateDocument({ ...document, pages });
    setSelectedPage(pages.length - 1);
    setPageIndex(pages.length - 1);
    setManageOpen(false);
  };
  const deletePage = () => {
    if (document.pages.length === 1) {
      Alert.alert('Keep one page', 'A document needs at least one page.');
      return;
    }
    const pages = document.pages.filter((_, index) => index !== selectedPage);
    updateDocument({ ...document, pages });
    setSelectedPage(Math.max(0, selectedPage - 1));
    setPageIndex(Math.min(pageIndex, pages.length - 1));
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topbar, { borderBottomColor: colors.border }]}>
        <Pressable accessibilityLabel="Close reader" onPress={() => router.back()} style={styles.iconButton}><Feather name="arrow-left" size={21} color={colors.foreground} /></Pressable>
        <View style={styles.titleWrap}><Text numberOfLines={1} style={[styles.readerTitle, { color: colors.foreground }]}>{document.name}</Text><Text style={[styles.pageMeta, { color: colors.mutedForeground }]}>Page {pageIndex + 1} of {document.pages.length}</Text></View>
        {!isPdfDocument && <Pressable accessibilityLabel="Page management" onPress={() => { setSelectedPage(pageIndex); setManageOpen(true); }} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}><Feather name="sidebar" size={18} color={colors.foreground} /></Pressable>}
      </View>
      <View style={[styles.toolrow, { borderBottomColor: colors.border }]}>
        <Pressable accessibilityLabel="Previous page" onPress={() => goToPage(pageIndex - 1)} style={styles.tool}><Feather name="chevron-left" size={19} color={pageIndex === 0 ? colors.border : colors.foreground} /></Pressable>
        <View style={[styles.zoomControl, { backgroundColor: colors.card, borderColor: colors.border }]}><Pressable accessibilityLabel="Decrease zoom" disabled={settings.zoomLocked} onPress={() => setZoom(clamp(zoom - 25, 25, 300))}><Feather name="minus" size={15} color={settings.zoomLocked ? colors.border : colors.foreground} /></Pressable><Text style={[styles.zoomText, { color: colors.foreground }]}>{zoom}%</Text><Pressable accessibilityLabel="Increase zoom" disabled={settings.zoomLocked} onPress={() => setZoom(clamp(zoom + 25, 25, 300))}><Feather name="plus" size={15} color={settings.zoomLocked ? colors.border : colors.foreground} /></Pressable><Pressable accessibilityLabel={settings.zoomLocked ? 'Unlock zoom' : 'Lock zoom'} onPress={() => setZoomLocked(!settings.zoomLocked)}><Feather name={settings.zoomLocked ? 'lock' : 'unlock'} size={14} color={settings.zoomLocked ? colors.primary : colors.mutedForeground} /></Pressable></View>
        <Pressable accessibilityLabel="Next page" onPress={() => goToPage(pageIndex + 1)} style={styles.tool}><Feather name="chevron-right" size={19} color={pageIndex === totalPages - 1 ? colors.border : colors.foreground} /></Pressable>
      </View>
      <View style={styles.readerArea} {...(isPdfDocument ? {} : panResponder.panHandlers)}>
        {isPdfDocument ? (
          pdfError ? (
            <View style={[styles.pdfError, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="alert-circle" size={24} color={colors.destructive} />
              <Text style={[styles.pdfErrorTitle, { color: colors.foreground }]}>Could not open this PDF</Text>
              <Text style={[styles.pdfErrorText, { color: colors.mutedForeground }]}>{pdfError}</Text>
            </View>
          ) : (
            <View style={[styles.pdfSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pdf
                ref={pdfRef}
                source={{ uri: document.uri, cache: false }}
                style={styles.pdfViewer}
                page={pageIndex + 1}
                scale={zoom / 100}
                minScale={0.5}
                maxScale={3}
                fitPolicy={2}
                enablePaging
                enableDoubleTapZoom
                onLoadComplete={handlePdfLoad}
                onPageChanged={handlePdfPageChanged}
                onError={(error) => setPdfError(error.message || 'The file could not be rendered.')}
              />
            </View>
          )
        ) : (
          <View style={[styles.page, { width: `${clamp(84 * zoom / 100, 48, 96)}%`, backgroundColor: '#FFFDFC', borderColor: '#E4E0D9' }]}>
            {currentPage?.kind === 'image' && currentPage.imageUri ? <Image source={{ uri: currentPage.imageUri }} contentFit="contain" style={styles.imagePage} /> : <><View style={styles.pageHeader}><View style={styles.pageMark} /><View style={styles.pageLineLong} /></View><Text style={styles.pageLabel}>Notebook page</Text><View style={styles.pageLines}>{Array.from({ length: 11 }).map((_, index) => <View key={index} style={styles.line} />)}</View><Text style={styles.pageNumber}>{pageIndex + 1}</Text></>}
          </View>
        )}
        {!isPdfDocument && <Text style={[styles.swipeHint, { color: colors.mutedForeground }]}>{pageIndex < totalPages - 1 ? 'Swipe to turn page' : 'End of document'}</Text>}
      </View>
      <View style={[styles.strip, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <FlatList horizontal data={visiblePages} keyExtractor={({ page }) => page.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripContent} renderItem={({ item }) => <Pressable onPress={() => goToPage(item.index)} style={[styles.thumb, { backgroundColor: item.index === pageIndex ? colors.accent : colors.background, borderColor: item.index === pageIndex ? colors.primary : colors.border }]}><Text style={[styles.thumbNumber, { color: item.index === pageIndex ? colors.accentForeground : colors.mutedForeground }]}>{item.index + 1}</Text><View style={styles.thumbLines}><View style={styles.thumbLine} /><View style={styles.thumbLine} /><View style={styles.thumbLine} /></View></Pressable>} />
      </View>
      {!isPdfDocument && <Modal visible={manageOpen} transparent animationType="slide" onRequestClose={() => setManageOpen(false)}>
        <View style={styles.modalBackdrop}><View style={[styles.modal, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]}><View style={styles.modalGrabber} /><View style={styles.modalHeader}><View><Text style={[styles.modalTitle, { color: colors.foreground }]}>Manage pages</Text><Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Page {selectedPage + 1} selected</Text></View><Pressable onPress={() => setManageOpen(false)} style={styles.iconButton}><Feather name="x" size={19} color={colors.foreground} /></Pressable></View><View style={styles.manageRow}><Pressable onPress={() => movePage(-1)} accessibilityLabel="Move page left" style={[styles.manageButton, { borderColor: colors.border }]}><Feather name="arrow-left" size={18} color={colors.foreground} /><Text style={[styles.manageLabel, { color: colors.foreground }]}>Move earlier</Text></Pressable><Pressable onPress={() => movePage(1)} accessibilityLabel="Move page right" style={[styles.manageButton, { borderColor: colors.border }]}><Feather name="arrow-right" size={18} color={colors.foreground} /><Text style={[styles.manageLabel, { color: colors.foreground }]}>Move later</Text></Pressable></View><View style={styles.manageRow}><Pressable onPress={addPage} accessibilityLabel="Add blank page" style={[styles.manageButton, { borderColor: colors.primary, backgroundColor: colors.primary }]}><Feather name="plus" size={18} color={colors.primaryForeground} /><Text style={[styles.manageLabel, { color: colors.primaryForeground }]}>Add page</Text></Pressable><Pressable onPress={() => { setManageOpen(false); void appendImagesToDocument(document); }} accessibilityLabel="Import images into document" style={[styles.manageButton, { borderColor: colors.accentForeground, backgroundColor: colors.accent }]}><Feather name="image" size={18} color={colors.accentForeground} /><Text style={[styles.manageLabel, { color: colors.accentForeground }]}>Import images</Text></Pressable></View><View style={styles.manageRow}><Pressable onPress={deletePage} accessibilityLabel="Delete selected page" style={[styles.manageButton, { borderColor: colors.destructive, backgroundColor: colors.destructive }]}><Feather name="trash-2" size={18} color={colors.destructiveForeground} /><Text style={[styles.manageLabel, { color: colors.destructiveForeground }]}>Delete selected page</Text></Pressable></View></View></View>
      </Modal>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFound: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  topbar: { minHeight: 68, borderBottomWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, gap: 3 },
  readerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  pageMeta: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  toolrow: { minHeight: 54, borderBottomWidth: 1, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tool: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  zoomControl: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, height: 36, flexDirection: 'row', alignItems: 'center', gap: 10 },
  zoomText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, minWidth: 38, textAlign: 'center' },
  readerArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 20, overflow: 'hidden' },
  pdfSurface: { flex: 1, width: '100%', borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  pdfViewer: { flex: 1, width: '100%' },
  pdfError: { width: '86%', borderWidth: 1, borderRadius: 14, padding: 24, alignItems: 'center', gap: 10 },
  pdfErrorTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, textAlign: 'center' },
  pdfErrorText: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  page: { aspectRatio: 0.72, borderRadius: 3, borderWidth: 1, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  pageHeader: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 26 },
  pageMark: { width: 18, height: 18, borderRadius: 4, backgroundColor: '#D5A06A' },
  pageLineLong: { width: '48%', height: 5, borderRadius: 3, backgroundColor: '#D8D4CC' },
  pageLabel: { color: '#90949B', fontFamily: 'Inter_500Medium', fontSize: 11, marginBottom: 14 },
  pageLines: { gap: 13 },
  line: { height: 2, borderRadius: 1, backgroundColor: '#E9E5DE', width: '92%' },
  pageNumber: { position: 'absolute', bottom: 18, right: 22, color: '#A9A49D', fontFamily: 'Inter_500Medium', fontSize: 11 },
  imagePage: { flex: 1, width: '100%', minHeight: 250 },
  pageHint: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#A7A9AD' },
  swipeHint: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  strip: { height: 104, borderTopWidth: 1 },
  stripContent: { paddingHorizontal: 18, paddingVertical: 14, gap: 9 },
  thumb: { width: 54, height: 70, borderWidth: 1, borderRadius: 8, alignItems: 'center', paddingTop: 8 },
  thumbNumber: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  thumbLines: { width: 32, gap: 5, marginTop: 8 },
  thumbLine: { height: 2, backgroundColor: '#D5D1CA', borderRadius: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(11, 16, 22, 0.45)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, gap: 18 },
  modalGrabber: { width: 38, height: 4, borderRadius: 3, backgroundColor: '#AAB3BE', alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  modalSub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  manageRow: { flexDirection: 'row', gap: 10 },
  manageButton: { flex: 1, minHeight: 51, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  manageLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});