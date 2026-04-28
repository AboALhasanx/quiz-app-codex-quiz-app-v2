import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GITHUB_DATA_API =
  "https://api.github.com/repos/AboALhasanx/quiz-app-data/releases/latest";

const DATA_DIR = FileSystem.documentDirectory + "subject_data/";
const CACHE_KEY = "subject_data_manifest_cache";
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export interface SubjectAsset {
  filename: string;        // e.g. "ai_data.json"
  downloadUrl: string;
  sizeBytes: number;
}

interface CachePayload {
  fetchedAt: number;
  assets: SubjectAsset[];
}

// ── Ensure data directory exists ─────────────────────────────────────────────
async function ensureDataDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DATA_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DATA_DIR, { intermediates: true });
  }
}

// ── Fetch asset list from GitHub (with 30-min cache) ─────────────────────────
export async function fetchSubjectAssets(): Promise<SubjectAsset[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const payload: CachePayload = JSON.parse(cached);
      if (Date.now() - payload.fetchedAt < CACHE_TTL_MS) {
        return payload.assets;
      }
    }
  } catch {
    // ignore cache errors
  }

  const response = await fetch(GITHUB_DATA_API, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

  const release = await response.json();
  const assets: SubjectAsset[] = (release.assets ?? [])
    .filter((a: any) => a.name.endsWith(".json"))
    .map((a: any) => ({
      filename: a.name,
      downloadUrl: a.browser_download_url,
      sizeBytes: a.size,
    }));

  try {
    const payload: CachePayload = { fetchedAt: Date.now(), assets };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }

  return assets;
}

// ── Status check (same size comparison as PDFs) ───────────────────────────────
export type DataAssetStatus = {
  asset: SubjectAsset;
  status: "not_downloaded" | "update_available" | "up_to_date";
};

export async function getSubjectDataStatuses(): Promise<DataAssetStatus[]> {
  const assets = await fetchSubjectAssets();
  const results: DataAssetStatus[] = [];

  for (const asset of assets) {
    const localPath = DATA_DIR + asset.filename;
    const info = await FileSystem.getInfoAsync(localPath);

    if (!info.exists) {
      results.push({ asset, status: "not_downloaded" });
    } else {
      const localSize = (info as any).size ?? 0;
      const status =
        localSize > 0 && localSize !== asset.sizeBytes
          ? "update_available"
          : "up_to_date";
      results.push({ asset, status });
    }
  }

  return results;
}

export function countDataUpdatesAvailable(statuses: DataAssetStatus[]): number {
  return statuses.filter(
    (s) => s.status !== "up_to_date"
  ).length;
}

// ── Download a single JSON asset ──────────────────────────────────────────────
export async function downloadSubjectAsset(asset: SubjectAsset): Promise<void> {
  await ensureDataDir();
  const localPath = DATA_DIR + asset.filename;
  const result = await FileSystem.downloadAsync(asset.downloadUrl, localPath);
  if (result.status !== 200) {
    throw new Error(`Download failed: HTTP ${result.status} for ${asset.filename}`);
  }
}

// ── Load subject data — offline-first ────────────────────────────────────────
// Priority: downloaded file → bundled JSON (APK fallback)
const BUNDLED_DATA: Record<string, any> = {
  "ai_data.json":  require("../data/subjects/ai_data.json"),
  "cn_data.json":  require("../data/subjects/cn_data.json"),
  "ds_data.json":  require("../data/subjects/ds_data.json"),
  "index.json":    require("../data/subjects/index.json"),
  "oop_data.json": require("../data/subjects/oop_data.json"),
  "os_data.json":  require("../data/subjects/os_data.json"),
  "se_data.json":  require("../data/subjects/se_data.json"),
};

export async function loadSubjectData(filename: string): Promise<any> {
  const localPath = DATA_DIR + filename;
  const info = await FileSystem.getInfoAsync(localPath);

  if (info.exists) {
    try {
      const raw = await FileSystem.readAsStringAsync(localPath);
      return JSON.parse(raw);
    } catch {
      // file corrupt → fall through to bundled
    }
  }

  // Offline fallback: bundled data baked into APK
  const bundled = BUNDLED_DATA[filename];
  if (bundled) return bundled;

  throw new Error(`Subject data not found: ${filename}`);
}

// ── Clear manifest cache (call after successful sync) ────────────────────────
export async function clearSubjectDataCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
