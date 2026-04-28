import NetInfo from "@react-native-community/netinfo";
import {
  directSaveBookmarkToFirestore,
  directSaveResultToFirestore,
  getCurrentUser,
} from "./firebase";
import {
  getBookmarks,
  getResults,
  getSyncQueue,
  setSyncQueue,
} from "./storage";

export async function flushAllLocalToFirebase(): Promise<{
  synced: { results: number; bookmarks: number };
}> {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    throw new Error("لا يوجد اتصال بالإنترنت");
  }

  if (!getCurrentUser()) {
    throw new Error("يجب تسجيل الدخول أولاً");
  }

  const [results, bookmarks, queue] = await Promise.all([
    getResults(),
    getBookmarks(),
    getSyncQueue(),
  ]);

  // Save all results directly to Firestore
  for (const result of results) {
    await directSaveResultToFirestore(result);
  }

  // Save all bookmarks directly to Firestore
  for (const bookmark of bookmarks) {
    await directSaveBookmarkToFirestore(bookmark);
  }

  // Clear the sync queue since everything is now pushed
  await setSyncQueue([]);

  return {
    synced: {
      results: results.length,
      bookmarks: bookmarks.length,
    },
  };
}
