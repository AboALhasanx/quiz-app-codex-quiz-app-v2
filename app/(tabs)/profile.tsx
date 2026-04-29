import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../../utils/ThemeContext";
import { auth, logoutUser } from "../../utils/firebase";
import { exportAllData, importAllData } from "../../utils/dataTransfer";
import { flushAllLocalToFirebase } from "../../utils/syncManager";
import { getPdfStatuses, countUpdatesAvailable, clearManifestCache } from "../../utils/pdfManifest";
import { downloadPdf } from "../../utils/pdfDownloader";
import {
  getSubjectDataStatuses,
  downloadSubjectAsset,
  clearSubjectDataCache,
  countDataUpdatesAvailable,
  DataAssetStatus,
} from "../../utils/subjectDataManager";
import {
  getVolume,
  setVolume,
  loadSoundSettings,
  isMuted,
  setMuted,
} from "../../utils/soundManager";

export default function ProfileScreen() {
  const { theme, isDark, toggle } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pdfUpdateCount, setPdfUpdateCount] = useState(0);
  const [syncState, setSyncState] = useState<"idle"|"checking"|"downloading"|"done"|"up_to_date"|"error">("idle");
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolumeState] = useState(1.0);

  useEffect(() => {
    loadSoundSettings().then(() => {
      setSoundEnabled(!isMuted());
      setVolumeState(getVolume());
    });
    Promise.all([
      getPdfStatuses(),
      getSubjectDataStatuses().catch(() => [] as DataAssetStatus[]),
    ]).then(([pdfStatuses, dataStatuses]) => {
      const count =
        countUpdatesAvailable(pdfStatuses) +
        countDataUpdatesAvailable(dataStatuses);
      setPdfUpdateCount(count);
    });
  }, []);

  const handlePdfSync = async () => {
    try {
      setSyncState("checking");

      // Check both PDFs and subject data
      const [pdfStatuses, dataStatuses] = await Promise.all([
        getPdfStatuses(),
        getSubjectDataStatuses().catch(() => [] as any),
      ]);

      const pdfToDownload = pdfStatuses.filter(
        (s) => s.status === "not_downloaded" || s.status === "update_available"
      );
      const dataToUpdate = dataStatuses.filter(
        (s: DataAssetStatus) => s.status !== "up_to_date"
      );

      const totalItems = pdfToDownload.length + dataToUpdate.length;

      if (totalItems === 0) {
        setSyncState("up_to_date");
        setTimeout(() => setSyncState("idle"), 3000);
        return;
      }

      setSyncState("downloading");
      setSyncProgress({ current: 0, total: totalItems });
      let completed = 0;

      // Download PDFs
      for (const item of pdfToDownload) {
        await downloadPdf(item.entry);
        completed += 1;
        setSyncProgress({ current: completed, total: totalItems });
      }

      // Download subject data
      for (const item of dataToUpdate) {
        await downloadSubjectAsset(item.asset);
        completed += 1;
        setSyncProgress({ current: completed, total: totalItems });
      }

      setSyncState("done");
      await Promise.all([clearManifestCache(), clearSubjectDataCache()]);

      const [freshPdf, freshData] = await Promise.all([
        getPdfStatuses(),
        getSubjectDataStatuses().catch(() => [] as DataAssetStatus[]),
      ]);
      const newCount =
        countUpdatesAvailable(freshPdf) +
        countDataUpdatesAvailable(freshData);
      setPdfUpdateCount(newCount);
      setTimeout(() => setSyncState("idle"), 3000);
    } catch {
      setSyncState("error");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await flushAllLocalToFirebase();
      Alert.alert(
        "تمت المزامنة",
        `${result.synced.results} نتيجة، ${result.synced.bookmarks} محفوظة`
      );
    } catch (error: any) {
      Alert.alert("خطأ", error?.message ?? "حدث خطأ أثناء المزامنة");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAllData();
      Alert.alert("تم", "تم تصدير البيانات بنجاح");
    } catch (error: any) {
      Alert.alert("خطأ", error?.message ?? "حدث خطأ أثناء التصدير");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (result.canceled) return;

      setImporting(true);
      const file = result.assets[0];
      const outcome = await importAllData(file.uri);
      Alert.alert(
        "تم الاستيراد",
        `تم الاستيراد: ${outcome.imported.results} نتيجة، ${outcome.imported.bookmarks} محفوظة`
      );
    } catch (error: any) {
      Alert.alert("خطأ", error?.message ?? "حدث خطأ أثناء الاستيراد");
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={s.content}
    >

      {/* — Section: المظهر — */}
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>المظهر</Text>
      <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "33" }]}>
        <Ionicons
          name={isDark ? "moon-outline" : "sunny-outline"}
          size={24}
          color={theme.textPrimary}
        />
        <Text style={[s.cardLabel, { color: theme.textPrimary }]}>الوضع الليلي</Text>
        <Switch
          value={isDark}
          onValueChange={toggle}
          trackColor={{ false: theme.secondary + "66", true: theme.primary }}
          thumbColor={theme.textPrimary}
        />
      </View>

      {/* — Section: الصوت — */}
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>الصوت</Text>
      <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "33" }]}>
        <Ionicons name={soundEnabled ? "volume-high-outline" : "volume-mute-outline"} size={24} color={theme.primary} />
        <Text style={[s.cardLabel, { color: theme.textPrimary }]}>الأصوات</Text>
        <Switch
          value={soundEnabled}
          onValueChange={async (value) => {
            await setMuted(!value);
            setSoundEnabled(value);
          }}
          trackColor={{ false: theme.secondary + "66", true: theme.primary }}
          thumbColor={theme.textPrimary}
        />
      </View>
      {soundEnabled && (
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "33", paddingVertical: 8 }]}>
          <Ionicons name="volume-low-outline" size={20} color={theme.textSecondary} />
          <Slider
            style={{ flex: 1, marginHorizontal: 8 }}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={volume}
            onValueChange={async (value) => {
              setVolumeState(value);
              await setVolume(value);
            }}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.secondary ? theme.secondary + "44" : "#ccc"}
            thumbTintColor={theme.primary}
          />
          <Ionicons name="volume-high-outline" size={20} color={theme.primary} />
        </View>
      )}

      {/* — Section: المزامنة — */}
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>المزامنة</Text>
      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "33" }]}
        onPress={handleSync}
        disabled={syncing}
        activeOpacity={0.8}
      >
        {syncing ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Ionicons name="sync-outline" size={24} color={theme.primary} />
        )}
        <View style={s.cardText}>
          <Text style={[s.cardTitle, { color: theme.textPrimary }]}>مزامنة مع السحابة</Text>
          <Text style={[s.cardSubtitle, { color: theme.textSecondary }]}>
            رفع جميع البيانات المحلية إلى Firebase
          </Text>
        </View>
        <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* — Section: البيانات — */}
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>البيانات</Text>

      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "33" }]}
        onPress={handleExport}
        disabled={exporting}
        activeOpacity={0.8}
      >
        {exporting ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Ionicons name="download-outline" size={24} color={theme.primary} />
        )}
        <View style={s.cardText}>
          <Text style={[s.cardTitle, { color: theme.textPrimary }]}>تصدير البيانات</Text>
          <Text style={[s.cardSubtitle, { color: theme.textSecondary }]}>
            حفظ المحفوظات والنتائج كملف JSON
          </Text>
        </View>
        <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "33" }]}
        onPress={handleImport}
        disabled={importing}
        activeOpacity={0.8}
      >
        {importing ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Ionicons name="cloud-upload-outline" size={24} color={theme.primary} />
        )}
        <View style={s.cardText}>
          <Text style={[s.cardTitle, { color: theme.textPrimary }]}>استيراد البيانات</Text>
          <Text style={[s.cardSubtitle, { color: theme.textSecondary }]}>
            استعادة بيانات من ملف نسخة احتياطية
          </Text>
        </View>
        <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* — Section: الملفات والمحتوى — */}
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>الملفات والمحتوى</Text>
      <TouchableOpacity
        style={[
          s.card,
          { backgroundColor: theme.card, borderColor: theme.secondary + "33" },
          (syncState === "checking" || syncState === "downloading" || syncState === "done" || syncState === "up_to_date") && { opacity: 0.7 },
        ]}
        onPress={syncState === "error" || syncState === "idle" ? handlePdfSync : undefined}
        disabled={syncState !== "idle" && syncState !== "error"}
        activeOpacity={0.8}
      >
        <Ionicons
          name={
            syncState === "done" || syncState === "up_to_date"
              ? "checkmark-circle-outline"
              : syncState === "error"
                ? "alert-circle-outline"
                : "cloud-download-outline"
          }
          size={24}
          color={
            syncState === "done" || syncState === "up_to_date"
              ? theme.correct
              : syncState === "error"
                ? theme.wrong
                : theme.primary
          }
        />
        <View style={s.cardText}>
          <Text style={[s.cardTitle, { color: theme.textPrimary }]}>
            {syncState === "checking" && "جاري الفحص..."}
            {syncState === "downloading" && `جاري التحميل ${syncProgress.current}/${syncProgress.total}`}
            {syncState === "done" && "اكتمل التحديث ✓"}
            {syncState === "up_to_date" && "الملفات محدّثة بالفعل"}
            {syncState === "error" && "فشل التحميل — اضغط للمحاولة مجدداً"}
            {syncState === "idle" && "تحديث الملازم والملخصات"}
          </Text>
          {syncState === "downloading" && (
            <View style={{ height: 3, backgroundColor: theme.secondary + "44", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
              <View style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: theme.primary,
                width: `${(syncProgress.current / syncProgress.total) * 100}%`,
              }} />
            </View>
          )}
        </View>
        {syncState === "checking" || syncState === "downloading" ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : syncState === "done" || syncState === "up_to_date" ? (
          <View style={[s.badge, { backgroundColor: theme.correct }]}>
            <Text style={s.badgeText}>مُحدّث</Text>
          </View>
        ) : syncState === "error" ? (
          <View style={[s.badge, { backgroundColor: theme.wrong }]}>
            <Text style={s.badgeText}>خطأ</Text>
          </View>
        ) : (
          <View style={[s.badge, { backgroundColor: pdfUpdateCount > 0 ? theme.wrong : theme.correct }]}>
            <Text style={s.badgeText}>
              {pdfUpdateCount > 0 ? String(pdfUpdateCount) : "مُحدّث"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* — Section: الحساب — */}
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>الحساب</Text>
      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "33" }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={24} color={theme.wrong} />
        <Text style={[s.cardLabel, { color: theme.wrong }]}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 80 },
  pageTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 20,
    textAlign: "right",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    gap: 14,
    minHeight: 56,
  },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 15, fontWeight: "bold", flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  cardSubtitle: { fontSize: 12, lineHeight: 18 },
  badge: {
    backgroundColor: "#6366f1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
});
