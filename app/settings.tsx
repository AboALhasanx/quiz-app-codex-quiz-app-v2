import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../utils/ThemeContext";
import { exportAllData, importAllData } from "../utils/dataTransfer";
import { flushAllLocalToFirebase } from "../utils/syncManager";
import Slider from "@react-native-community/slider";
import {
  loadSoundSettings,
  isMuted,
  setMuted,
  getVolume,
  setVolume,
} from "../utils/soundManager";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolumeState] = useState(1.0);

  useEffect(() => {
    loadSoundSettings().then(() => {
      setSoundEnabled(!isMuted());
      setVolumeState(getVolume());
    });
  }, []);

  const handleSoundToggle = async (value: boolean) => {
    await setMuted(!value);
    setSoundEnabled(value);
  };

  const handleVolumeChange = async (value: number) => {
    setVolumeState(value);
    await setVolume(value);
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={s.content}
    >
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="chevron-forward" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.textPrimary }]}>الإعدادات</Text>
      </View>

      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>صوت</Text>

      <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "44" }]}>
        <Ionicons name={soundEnabled ? "volume-high-outline" : "volume-mute-outline"} size={24} color={theme.primary} />
        <Text style={[s.cardLabel, { color: theme.textPrimary, flex: 1 }]}>الأصوات</Text>
        <Switch
          value={soundEnabled}
          onValueChange={handleSoundToggle}
          trackColor={{ false: theme.secondary + "66", true: theme.primary }}
          thumbColor={theme.textPrimary}
        />
      </View>
      {soundEnabled && (
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "44", paddingVertical: 8 }]}>
          <Ionicons name="volume-low-outline" size={20} color={theme.textSecondary} />
          <Slider
            style={{ flex: 1, marginHorizontal: 8 }}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.secondary ? theme.secondary + "44" : "#ccc"}
            thumbTintColor={theme.primary}
          />
          <Ionicons name="volume-high-outline" size={20} color={theme.primary} />
        </View>
      )}

      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>
        المزامنة
      </Text>

      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "44" }]}
        onPress={handleSync}
        disabled={syncing}
        activeOpacity={0.8}
      >
        {syncing ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Ionicons name="sync-outline" size={28} color={theme.primary} />
        )}
        <View style={s.cardText}>
          <Text style={[s.cardTitle, { color: theme.textPrimary }]}>مزامنة مع السحابة</Text>
          <Text style={[s.cardSubtitle, { color: theme.textSecondary }]}>
            رفع جميع البيانات المحلية إلى Firebase
          </Text>
        </View>
        <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>
        البيانات المحلية
      </Text>

      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "44" }]}
        onPress={handleExport}
        disabled={exporting}
        activeOpacity={0.8}
      >
        {exporting ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Ionicons name="download-outline" size={28} color={theme.primary} />
        )}
        <View style={s.cardText}>
          <Text style={[s.cardTitle, { color: theme.textPrimary }]}>تصدير البيانات</Text>
          <Text style={[s.cardSubtitle, { color: theme.textSecondary }]}>
            حفظ المحفوظات والنتائج كملف
          </Text>
        </View>
        <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card, borderColor: theme.secondary + "44" }]}
        onPress={handleImport}
        disabled={importing}
        activeOpacity={0.8}
      >
        {importing ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Ionicons name="cloud-upload-outline" size={28} color={theme.primary} />
        )}
        <View style={s.cardText}>
          <Text style={[s.cardTitle, { color: theme.textPrimary }]}>استيراد البيانات</Text>
          <Text style={[s.cardSubtitle, { color: theme.textSecondary }]}>
            استعادة بيانات من ملف نسخة احتياطية
          </Text>
        </View>
        <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold" },
  sectionTitle: { fontSize: 13, marginBottom: 12, textAlign: "right" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 14,
  },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 15, fontWeight: "bold" },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  cardSubtitle: { fontSize: 12, lineHeight: 18 },
});
