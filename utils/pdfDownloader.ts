import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { PdfManifestEntry } from "./pdfManifest";

export async function downloadPdf(entry: PdfManifestEntry): Promise<string> {
  const dir = FileSystem.documentDirectory + "pdfs/";
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const localPath = dir + entry.filename;
  const result = await FileSystem.downloadAsync(entry.downloadUrl, localPath);

  if (result.status !== 200) {
    throw new Error(`Download failed: HTTP ${result.status}`);
  }

  return localPath;
}

export async function openPdf(localPath: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) throw new Error("Sharing not available on this device");
  await Sharing.shareAsync(localPath, {
    mimeType: "application/pdf",
    dialogTitle: "فتح الملف",
  });
}
