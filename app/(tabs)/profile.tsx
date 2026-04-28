import { useState } from "react";
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
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../../utils/ThemeContext";
import { auth, logoutUser } from "../../utils/firebase";
import { exportAllData, importAllData } from "../../utils/dataTransfer";
import { flushAllLocalToFirebase } from "../../utils/syncManager";

export default function ProfileScreen() {
  const { theme, isDark, toggle } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

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
      <View
        style={[
          s.card,
          { backgroundColor: theme.card, borderColor: theme.secondary + "33", opacity: 0.5 },
        ]}
      >
        <Ionicons name="volume-medium-outline" size={24} color={theme.textSecondary} />
        <Text style={[s.cardLabel, { color: theme.textSecondary }]}>التحكم بالصوت</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>قريباً</Text>
        </View>
      </View>

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
          { backgroundColor: theme.card, borderColor: theme.secondary + "33", opacity: 0.7 },
        ]}
        onPress={() =>
          Alert.alert("قريباً", "هذه الميزة ستكون متاحة في الإصدار القادم")
        }
        activeOpacity={0.8}
      >
        <Ionicons name="cloud-download-outline" size={24} color={theme.textSecondary} />
        <Text style={[s.cardLabel, { color: theme.textSecondary }]}>تحديث الملازم والملخصات</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>قريباً</Text>
        </View>
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
