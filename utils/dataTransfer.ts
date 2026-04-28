import AsyncStorage from "@react-native-async-storage/async-storage";
import { Paths, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  Bookmark,
  getBookmarks,
  getResults,
  getSyncQueue,
  QuizResult,
  SyncQueueItem,
} from "./storage";

const THEME_KEY = "user_theme";

const KEYS = {
  results: "quiz_results",
  bookmarks: "quiz_bookmarks",
} as const;

export type ExportPayload = {
  version: number;
  exportedAt: string;
  results: QuizResult[];
  bookmarks: Bookmark[];
  syncQueue: SyncQueueItem[];
  theme: string | null;
};

export async function exportAllData(): Promise<{ success: true }> {
  const [results, bookmarks, syncQueue, theme] = await Promise.all([
    getResults(),
    getBookmarks(),
    getSyncQueue(),
    AsyncStorage.getItem(THEME_KEY),
  ]);

  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    results,
    bookmarks,
    syncQueue,
    theme,
  };

  const json = JSON.stringify(payload, null, 2);
  const file = new File(Paths.document, "quiz-backup.json");
  await file.write(json);

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("المشاركة غير متوفرة على هذا الجهاز");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "تصدير بيانات التطبيق",
  });

  return { success: true };
}

export async function importAllData(
  uri: string
): Promise<{ imported: { results: number; bookmarks: number } }> {
  let raw: string;

  try {
    const file = new File(uri);
    raw = await file.text();
  } catch {
    throw new Error("تعذر قراءة الملف. تأكد من أنه ملف JSON صالح.");
  }

  let payload: Partial<ExportPayload>;

  try {
    payload = JSON.parse(raw) as Partial<ExportPayload>;
  } catch {
    throw new Error("الملف ليس بصيغة JSON صالحة.");
  }

  if (!payload.version || (!payload.results && !payload.bookmarks)) {
    throw new Error("ملف غير صالح: يجب أن يحتوي على version ونتائج أو محفوظات.");
  }

  const importedResults = payload.results ?? [];
  const importedBookmarks = payload.bookmarks ?? [];

  // Merge results: combine existing + imported, deduplicate by id
  const existingResults = await getResults();
  const resultsMap = new Map<string, QuizResult>();
  for (const r of existingResults) resultsMap.set(r.id, r);
  for (const r of importedResults) resultsMap.set(r.id, r);
  const mergedResults = Array.from(resultsMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  await AsyncStorage.setItem(KEYS.results, JSON.stringify(mergedResults));

  // Merge bookmarks: combine, deduplicate by questionId
  const existingBookmarks = await getBookmarks();
  const bookmarksMap = new Map<string, Bookmark>();
  for (const b of existingBookmarks) bookmarksMap.set(b.questionId, b);
  for (const b of importedBookmarks) bookmarksMap.set(b.questionId, b);
  const mergedBookmarks = Array.from(bookmarksMap.values());
  await AsyncStorage.setItem(KEYS.bookmarks, JSON.stringify(mergedBookmarks));

  // Restore theme if present
  if (payload.theme === "dark" || payload.theme === "light") {
    await AsyncStorage.setItem(THEME_KEY, payload.theme);
  }

  return {
    imported: {
      results: importedResults.length,
      bookmarks: importedBookmarks.length,
    },
  };
}
