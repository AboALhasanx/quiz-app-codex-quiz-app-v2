import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../utils/ThemeContext";
import {
  getPdfStatuses,
  countUpdatesAvailable,
  PdfFileStatus,
} from "../../utils/pdfManifest";
import { downloadPdf, openPdf, DownloadProgress } from "../../utils/pdfDownloader";

const SUBJECT_NAMES: Record<string, string> = {
  ai_data: "الذكاء الاصطناعي",
  ds_data: "هياكل البيانات",
  cn_data: "شبكات الحاسوب",
  oop_data: "البرمجة الكائنية",
  os_data: "أنظمة التشغيل",
  se_data: "هندسة البرمجيات",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function PdfsScreen() {
  const { theme } = useTheme();
  const [statuses, setStatuses] = useState<PdfFileStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const loadStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getPdfStatuses();
      setStatuses(s);
    } catch (e) {
      setError("فشل تحميل قائمة الملفات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatuses();
  }, []);

  const handleDownload = async (file: PdfFileStatus) => {
    setDownloadingIds((prev) => new Set(prev).add(file.id));
    try {
      await downloadPdf(file, (p: DownloadProgress) => {
        setProgressMap((prev) => ({ ...prev, [p.id]: p.progress }));
      });
      await loadStatuses();
    } catch {
      Alert.alert("خطأ", "فشل تحميل الملف");
    } finally {
      setDownloadingIds((prev) => {
        const s = new Set(prev);
        s.delete(file.id);
        return s;
      });
      setProgressMap((prev) => {
        const m = { ...prev };
        delete m[file.id];
        return m;
      });
    }
  };

  const handleDownloadAll = async () => {
    const pending = statuses.filter(
      (s) => s.status === "not_downloaded" || s.status === "update_available"
    );
    for (const file of pending) {
      await handleDownload(file);
    }
  };

  const handleOpen = async (file: PdfFileStatus) => {
    if (!file.localPath) return;
    try {
      await openPdf(file.localPath);
    } catch (e: any) {
      Alert.alert("خطأ", "لا يمكن فتح الملف");
    }
  };

  // Group by subjectId preserving order
  const subjectOrder = ["ai_data", "ds_data", "cn_data", "oop_data", "os_data", "se_data"];
  const grouped = new Map<string, PdfFileStatus[]>();
  for (const subj of subjectOrder) {
    const files = statuses.filter((f) => f.subjectId === subj);
    if (files.length > 0) grouped.set(subj, files);
  }

  const updatesCount = countUpdatesAvailable(statuses);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center", gap: 12 }}>
        <Text style={{ color: theme.wrong, fontSize: 16 }}>{error}</Text>
        <TouchableOpacity
          onPress={() => void loadStatuses()}
          style={{ backgroundColor: theme.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.card, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="chevron-forward" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.textPrimary }}>
          الملازم والملخصات
        </Text>
      </View>

      {/* Update banner */}
      {updatesCount > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: theme.wrong + "22", borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <Ionicons name="alert-circle-outline" size={20} color={theme.wrong} />
          <Text style={{ flex: 1, color: theme.textPrimary, fontSize: 13 }}>
            {updatesCount} ملف غير محمل
          </Text>
        </View>
      )}

      {/* Download all button */}
      {updatesCount > 0 && (
        <TouchableOpacity
          onPress={handleDownloadAll}
          style={{
            backgroundColor: theme.primary,
            borderRadius: 12,
            paddingVertical: 14,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <Ionicons name="cloud-download-outline" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>تحميل الكل</Text>
        </TouchableOpacity>
      )}

      {/* Subject groups */}
      {Array.from(grouped.entries()).map(([subjectId, files]) => (
        <View key={subjectId} style={{ marginBottom: 16 }}>
          {/* Section header */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: theme.textSecondary,
              marginBottom: 8,
              textAlign: "right",
            }}
          >
            {SUBJECT_NAMES[subjectId] || subjectId}
          </Text>

          {/* File rows */}
          {files.map((file, idx) => {
            const isDownloading = downloadingIds.has(file.id);
            const progress = progressMap[file.id] ?? 0;
            const isUpToDate = file.status === "up_to_date";

            return (
              <TouchableOpacity
                key={file.id}
                onPress={() => {
                  if (isDownloading) return;
                  if (isUpToDate) void handleOpen(file);
                  else void handleDownload(file);
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.card,
                  borderColor: theme.secondary + "33",
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 6,
                  gap: 10,
                  opacity: isDownloading ? 0.7 : 1,
                }}
              >
                {/* Icon */}
                <Ionicons
                  name={file.type === "summary" ? "document-text-outline" : "book-outline"}
                  size={20}
                  color={isUpToDate ? theme.correct : theme.primary}
                />

                {/* Name + size */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: theme.textPrimary, fontSize: 13, fontWeight: "600", textAlign: "right" }}
                  >
                    {file.name}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, textAlign: "right" }}>
                    {formatSize(file.size)}
                  </Text>
                </View>

                {/* Status indicator */}
                {isDownloading ? (
                  <View style={{ width: 60, alignItems: "center" }}>
                    <View
                      style={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: theme.secondary + "44",
                        width: "100%",
                        overflow: "hidden",
                        marginBottom: 2,
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          backgroundColor: theme.primary,
                          width: `${Math.round(progress * 100)}%`,
                          borderRadius: 2,
                        }}
                      />
                    </View>
                    <Text style={{ color: theme.primary, fontSize: 9 }}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                ) : isUpToDate ? (
                  <Ionicons name="checkmark-circle" size={20} color={theme.correct} />
                ) : file.status === "update_available" ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="arrow-up-circle-outline" size={20} color={theme.wrong} />
                    <Text style={{ color: theme.wrong, fontSize: 10, fontWeight: "bold" }}>
                      v{file.version}
                    </Text>
                  </View>
                ) : (
                  <Ionicons name="cloud-download-outline" size={20} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
