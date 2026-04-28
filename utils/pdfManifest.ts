import * as FileSystem from "expo-file-system/legacy";
import { getAllDownloadRecords } from "./pdfStorage";

export type PdfManifestEntry = {
  id: string;
  subjectId: string;
  chapterId: string;
  type: "lecture" | "summary";
  name: string;
  filename: string;
  url: string;
  size: number;
  checksum: string;
  version: number;
  updatedAt: string;
};

export type PdfManifest = {
  version: number;
  updatedAt: string;
  remoteManifestUrl: string;
  files: PdfManifestEntry[];
};

export type PdfFileStatus = PdfManifestEntry & {
  status: "not_downloaded" | "up_to_date" | "update_available";
  localPath: string | null;
  localVersion: number | null;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const localManifest: PdfManifest = require("../data/pdf-manifest.json");

const MANIFEST_CACHE_PATH = FileSystem.documentDirectory + "pdf-manifest-cache.json";

export async function fetchRemoteManifest(): Promise<PdfManifest> {
  try {
    const remoteUrl = localManifest.remoteManifestUrl;
    if (!remoteUrl || remoteUrl === "PLACEHOLDER") return localManifest;
    const url = `${remoteUrl}?t=${Date.now()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data: PdfManifest = await res.json();
    await FileSystem.writeAsStringAsync(MANIFEST_CACHE_PATH, JSON.stringify(data));
    return data;
  } catch {
    try {
      const info = await FileSystem.getInfoAsync(MANIFEST_CACHE_PATH);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(MANIFEST_CACHE_PATH);
        return JSON.parse(raw) as PdfManifest;
      }
    } catch {}
    return localManifest;
  }
}

export async function getPdfStatuses(): Promise<PdfFileStatus[]> {
  const manifest = await fetchRemoteManifest();
  const records = await getAllDownloadRecords();
  return manifest.files.map((file) => {
    const record = records.find((r) => r.id === file.id);
    if (!record) {
      return { ...file, status: "not_downloaded", localPath: null, localVersion: null };
    }
    const status = record.version >= file.version ? "up_to_date" : "update_available";
    return { ...file, status, localPath: record.localPath, localVersion: record.version };
  });
}

export function countUpdatesAvailable(statuses: PdfFileStatus[]): number {
  return statuses.filter(
    (s) => s.status === "update_available" || s.status === "not_downloaded"
  ).length;
}
