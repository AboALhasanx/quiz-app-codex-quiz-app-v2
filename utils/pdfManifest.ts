import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GITHUB_API_URL =
  "https://api.github.com/repos/AboALhasanx/quiz-app-pdfs/releases/latest";

const CACHE_KEY = "pdf_manifest_cache";
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export interface PdfManifestEntry {
  id: string;           // unique: subjectId_type_chapterId
  filename: string;     // e.g. "AI_Ch01.pdf"
  downloadUrl: string;  // browser_download_url from GitHub
  sizeBytes: number;    // size from GitHub asset
  subjectId: string;    // derived from filename
  type: "lecture" | "summary";
}

interface CachePayload {
  fetchedAt: number;
  entries: PdfManifestEntry[];
}

// ── Derive subject ID from filename ─────────────────────────────────────────
function deriveSubjectId(filename: string): string {
  const base = filename.replace(/^Sum_/, "").toLowerCase();
  if (base.startsWith("ai_"))   return "ai_data";
  if (base.startsWith("algo_")) return "ds_data";
  if (base.startsWith("net_"))  return "cn_data";
  if (base.startsWith("oop_"))  return "oop_data";
  if (base.startsWith("os_"))   return "os_data";
  if (base.startsWith("se_"))   return "se_data";
  return "unknown";
}

// ── Derive chapter ID from filename ─────────────────────────────────────────
function deriveChapterId(filename: string): string {
  const base = filename.replace(/^Sum_/, "").replace(/\.pdf$/i, "");
  const match = base.match(/Ch(\d+)/i);
  if (match) return "ch" + parseInt(match[1], 10).toString();
  const parts = base.split("_");
  const withoutPrefix = parts.slice(1).join("_");
  return withoutPrefix.toLowerCase().replace(/[^a-z0-9]/g, "_") || base.toLowerCase();
}

// ── Parse GitHub release asset into PdfManifestEntry ────────────────────────
function parseAsset(asset: {
  name: string;
  size: number;
  browser_download_url: string;
}): PdfManifestEntry | null {
  if (!asset.name.toLowerCase().endsWith(".pdf")) return null;

  const filename = asset.name;
  const isSummary = filename.startsWith("Sum_");
  const subjectId = deriveSubjectId(filename);
  const chapterId = deriveChapterId(filename);
  const typePrefix = isSummary ? "sum" : "lec";
  const id = `${subjectId}_${typePrefix}_${chapterId}`;

  return {
    id,
    filename,
    downloadUrl: asset.browser_download_url,
    sizeBytes: asset.size,
    subjectId,
    type: isSummary ? "summary" : "lecture",
  };
}

// ── Fetch manifest from GitHub API (with 30-min cache) ──────────────────────
export async function fetchPdfManifest(): Promise<PdfManifestEntry[]> {
  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const payload: CachePayload = JSON.parse(cached);
      if (Date.now() - payload.fetchedAt < CACHE_TTL_MS) {
        return payload.entries;
      }
    }
  } catch {
    // ignore cache errors
  }

  // Fetch from GitHub
  const response = await fetch(GITHUB_API_URL, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const release = await response.json();
  const entries: PdfManifestEntry[] = [];

  for (const asset of release.assets ?? []) {
    const entry = parseAsset(asset);
    if (entry) entries.push(entry);
  }

  // Save cache
  try {
    const payload: CachePayload = { fetchedAt: Date.now(), entries };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore cache save errors
  }

  return entries;
}

// ── Get statuses (compare remote size vs local file size) ───────────────────
export type PdfStatus = {
  entry: PdfManifestEntry;
  status: "not_downloaded" | "update_available" | "up_to_date";
};

export async function getPdfStatuses(): Promise<PdfStatus[]> {
  const entries = await fetchPdfManifest();
  const results: PdfStatus[] = [];

  for (const entry of entries) {
    const localPath = FileSystem.documentDirectory + "pdfs/" + entry.filename;
    const info = await FileSystem.getInfoAsync(localPath);

    if (!info.exists) {
      results.push({ entry, status: "not_downloaded" });
    } else {
      const localSize = (info as any).size ?? 0;
      const status =
        localSize > 0 && localSize !== entry.sizeBytes
          ? "update_available"
          : "up_to_date";
      results.push({ entry, status });
    }
  }

  return results;
}

export function countUpdatesAvailable(statuses: PdfStatus[]): number {
  return statuses.filter(
    (s) => s.status === "not_downloaded" || s.status === "update_available"
  ).length;
}

// ── Force clear cache (call this after a successful sync) ────────────────────
export async function clearManifestCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (e) {
    console.warn("Storage error:", e);
  }
}
