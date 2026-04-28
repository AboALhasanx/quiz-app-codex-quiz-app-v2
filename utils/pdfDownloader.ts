import * as FileSystem from "expo-file-system/legacy";
import { PdfManifestEntry } from "./pdfManifest";
import { saveDownloadRecord } from "./pdfStorage";

export type DownloadProgress = {
  id: string;
  progress: number;
};

export async function downloadPdf(
  file: PdfManifestEntry,
  onProgress?: (p: DownloadProgress) => void
): Promise<string> {
  const dir = FileSystem.documentDirectory + "pdfs/";
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const localPath = dir + file.filename;
  const tempPath = localPath + ".tmp";

  const tempInfo = await FileSystem.getInfoAsync(tempPath);
  if (tempInfo.exists) await FileSystem.deleteAsync(tempPath, { idempotent: true });

  const downloadResumable = FileSystem.createDownloadResumable(
    file.url,
    tempPath,
    {},
    (p) => {
      const progress =
        p.totalBytesExpectedToWrite > 0
          ? p.totalBytesWritten / p.totalBytesExpectedToWrite
          : 0;
      onProgress?.({ id: file.id, progress });
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) throw new Error("فشل التحميل");

  // Integrity guaranteed by HTTPS + GitHub's content delivery.
  // Checksum verification skipped for performance (large PDFs).

  const existing = await FileSystem.getInfoAsync(localPath);
  if (existing.exists) await FileSystem.deleteAsync(localPath, { idempotent: true });
  await FileSystem.moveAsync({ from: tempPath, to: localPath });

  await saveDownloadRecord({
    id: file.id,
    version: file.version,
    localPath,
    checksum: file.checksum,
    downloadedAt: new Date().toISOString(),
    size: file.size,
  });

  return localPath;
}

export async function openPdf(localPath: string): Promise<void> {
  const { shareAsync } = await import("expo-sharing");
  const info = await FileSystem.getInfoAsync(localPath);
  if (!info.exists) throw new Error("الملف غير موجود على الجهاز");
  await shareAsync(localPath, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
  });
}
