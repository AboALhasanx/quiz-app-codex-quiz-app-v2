import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "pdf_downloads";

export type PdfDownloadRecord = {
  id: string;
  version: number;
  localPath: string;
  checksum: string;
  downloadedAt: string;
  size: number;
};

export async function getAllDownloadRecords(): Promise<PdfDownloadRecord[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getDownloadRecord(id: string): Promise<PdfDownloadRecord | null> {
  const all = await getAllDownloadRecords();
  return all.find((r) => r.id === id) ?? null;
}

export async function saveDownloadRecord(record: PdfDownloadRecord): Promise<void> {
  const all = await getAllDownloadRecords();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}
