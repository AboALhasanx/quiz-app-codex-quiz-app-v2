# Project Status — 2026-04-29

## Stack

| المكتبة | الإصدار |
|---------|---------|
| Expo SDK | ~55.0.9 |
| React Native | 0.83.2 |
| expo-audio | ~55.0.14 |
| expo-router | ~55.0.8 |
| firebase | ^12.10.0 |
| @react-native-community/slider | 5.1.2 |
| @react-native-community/netinfo | 11.5.2 |
| expo-file-system | ~55.0.12 |
| expo-sharing | ~55.0.18 |
| expo-document-picker | ~55.0.13 |
| TypeScript | ~5.9.2 |
| EAS Profiles | development, preview, production |
| Target | Android APK (preview profile) |

---

## Screens & Routes

| File | الوصف |
|------|-------|
| `app/_layout.tsx` | التخطيط الجذري — مزامنة تلقائية عند العودة للتطبيق |
| `app/+not-found.tsx` | صفحة 404 |
| `app/login.tsx` | تسجيل الدخول بالبريد وكلمة المرور |
| `app/settings.tsx` | شاشة الإعدادات (صوت، مزامنة، تصدير/استيراد) |
| `app/(tabs)/_layout.tsx` | تخطيط التبويبات — الرئيسية، إحصائياتي، المحفوظات، الإعدادات |
| `app/(tabs)/index.tsx` | الرئيسية — قائمة المواد مع آخر نتيجة |
| `app/(tabs)/stats.tsx` | إحصائياتي — سجل الاختبارات والنتائج |
| `app/(tabs)/bookmarks.tsx` | المحفوظات — الأسئلة المحفوظة مع فلتر المواد |
| `app/(tabs)/profile.tsx` | الإعدادات — مظهر، صوت، مزامنة، بيانات، ملفات، حساب |
| `app/bookmarks/[questionId].tsx` | تفاصيل سؤال محفوظ |
| `app/chapter/[id].tsx` | تفاصيل الفصل — المواضيع والتقدم وزر الاختبار |
| `app/quiz/setup.tsx` | إعداد الاختبار — الوضع، الترتيب، النسبة المئوية |
| `app/quiz/play.tsx` | شاشة الاختبار — الأسئلة، المؤقت، المحفوظات، الصوت |
| `app/quiz/result.tsx` | نتيجة الاختبار — الدرجة، المراجعة، حفظ النتيجة |
| `app/subject/[id].tsx` | تفاصيل المادة — قائمة الفصول والتقدم |

---

## Utils & Services

| File | الوصف |
|------|-------|
| `utils/storage.ts` | التخزين الرئيسي — النتائج، المحفوظات، الإكمال، طابور المزامنة، الجلسة |
| `utils/firebase.ts` | Firebase Auth + Firestore CRUD + طابور المزامنة |
| `utils/soundManager.ts` | إدارة الصوت — تشغيل، كتم، مستوى الصوت (expo-audio) |
| `utils/subjectDataManager.ts` | بيانات المواد من GitHub مع نسخة مدمجة كبديل |
| `utils/subjects.ts` | أنواع البيانات، محملات المواد، مساعدات الأسئلة |
| `utils/pdfManifest.ts` | جلب قائمة PDFs من GitHub API مع تخزين مؤقت |
| `utils/pdfDownloader.ts` | تحميل PDFs من GitHub releases |
| `utils/pdfStorage.ts` | تخزين سجلات تحميل PDF في AsyncStorage |
| `utils/dataTransfer.ts` | تصدير/استيراد جميع البيانات كملف JSON |
| `utils/syncManager.ts` | مزامنة جميع البيانات المحلية إلى Firebase |
| `utils/theme.ts` | تعريف ألوان الثيم الفاتح والداكن |
| `utils/ThemeContext.tsx` | React Context للثيم مع حفظ في AsyncStorage |

---

## Components

| File | الوصف |
|------|-------|
| `components/haptic-tab.tsx` | تبويب مع اهتزاز عند الضغط |
| `components/external-link.tsx` | رابط خارجي يفتح في المتصفح |

---

## Data Layer

| الملف | الوصف |
|-------|-------|
| `data/subjects/index.json` | فهرس المواد الدراسية |
| `data/subjects/ai_data.json` | أسئلة الذكاء الاصطناعي |
| `data/subjects/cn_data.json` | أسئلة الشبكات |
| `data/subjects/ds_data.json` | أسئلة هياكل البيانات |
| `data/subjects/oop_data.json` | أسئلة البرمجة الكائنية |
| `data/subjects/os_data.json` | أسئلة أنظمة التشغيل |
| `data/subjects/se_data.json` | أسئلة هندسة البرمجيات |

- **GitHub Repo:** [AboALhasanx/quiz-app-data](https://github.com/AboALhasanx/quiz-app-data)
- **Release:** v1
- **الاستراتيجية:** offline-first — الملفات المحمّلة أولاً ← الملفات المدمجة في APK

---

## Sound System

| البند | القيمة |
|-------|--------|
| المكتبة | expo-audio (مهاجرة من expo-av) |
| ملف الإدارة | `utils/soundManager.ts` |
| مفتاح الكتم | `sound_muted` (AsyncStorage) |
| مفتاح مستوى الصوت | `sound_volume` (AsyncStorage) |
| كتم الصوت | ✅ يعمل |
| شريط مستوى الصوت | ✅ يعمل |
| أصوات الاختبار | correct.mp3, wrong.mp3, completed.mp3 |

---

## Known Issues / TODOs

- لا توجد مشاكل معروفة حالياً
- التطبيق يعمل بشكل مستقر على Expo Go

---

## Last APK Build

| البند | القيمة |
|-------|--------|
| Profile | preview |
| Status | ✅ built successfully |
