# Quiz App — دليل المشروع الشامل

> **الإصدار:** 1.0.1 | **التاريخ:** 2026-04-29 | **المنصة:** Android (Expo Go + APK)

---

## نظرة عامة

تطبيق "تنافسي البرمجيات" هو تطبيق تعليمي مصمم لطلاب تخصص علوم الحاسوب للاختبار والمراجعة. يوفر التطبيق بنك أسئلة شامل يغطي 6 مواد دراسية (الذكاء الاصطناعي، الشبكات، هياكل البيانات، البرمجة الكائنية، أنظمة التشغيل، هندسة البرمجيات) مع ميزات تشمل اختبارات تفاعلية، حفظ الأسئلة، إحصائيات مفصلة، ونظام مزامنة سحابي. التطبيق يعمل بنظام offline-first حيث يتم تخزين البيانات محلياً مع إمكانية المزامنة مع Firebase.

---

## Stack التقني

| المكتبة | الإصدار | الوظيفة |
|---------|---------|---------|
| expo | ~55.0.9 | إطار العمل الأساسي |
| react | 19.2.0 | مكتبة واجهة المستخدم |
| react-native | 0.83.2 | بناء واجهات الهاتف |
| expo-router | ~55.0.8 | التنقل بين الشاشات (file-based routing) |
| expo-audio | ~55.0.14 | تشغيل الأصوات |
| expo-file-system | ~55.0.12 | إدارة الملفات المحلية |
| expo-sharing | ~55.0.18 | مشاركة الملفات |
| expo-document-picker | ~55.0.13 | اختيار الملفات للاستيراد |
| expo-haptics | ~55.0.9 | اهتزاز عند الضغط |
| expo-image | ~55.0.6 | تحميل الصور |
| expo-splash-screen | ~55.0.13 | شاشة البداية |
| expo-status-bar | ~55.0.4 | شريط الحالة |
| expo-system-ui | ~55.0.11 | ألوان النظام |
| expo-constants | ~55.0.9 | ثوابت التطبيق |
| expo-asset | ~55.0.10 | إدارة الأصول |
| expo-font | ~55.0.4 | الخطوط |
| expo-clipboard | ~55.0.9 | النسخ واللصق |
| expo-linking | ~55.0.9 | الروابط العميقة |
| expo-intent-launcher | ~55.0.9 | إطلاق النوايا (Android) |
| expo-web-browser | ~55.0.10 | فتح المتصفح |
| firebase | ^12.10.0 | Auth + Firestore |
| @react-native-async-storage/async-storage | 2.2.0 | التخزين المحلي |
| @react-native-community/slider | 5.1.2 | شريط مستوى الصوت |
| @react-native-community/netinfo | 11.5.2 | كشف الاتصال بالإنترنت |
| @react-navigation/native | ^7.2.2 | التنقل |
| @expo/vector-icons | ^15.0.3 | الأيقونات (Ionicons) |
| react-native-gesture-handler | ~2.30.0 | معالجة الإيماءات |
| react-native-reanimated | 4.2.1 | الرسوم المتحركة |
| react-native-screens | ~4.23.0 | إدارة الشاشات |
| react-native-safe-area-context | ~5.6.0 | المناطق الآمنة |
| react-native-web | ~0.21.0 | دعم الويب |
| react-native-worklets | 0.7.4 | الخيوط الجانبية |
| typescript | ~5.9.2 | التحقق من الأنواع |
| eslint | ^9.25.0 | فحص الكود |

---

## هيكل الملفات

```
quiz-app/
├── app/
│   ├── _layout.tsx              ← التخطيط الجذري (مزامنة تلقائية عند العودة)
│   ├── +not-found.tsx           ← صفحة 404
│   ├── login.tsx                ← تسجيل الدخول
│   ├── settings.tsx             ← إعدادات (صوت، مزامنة، تصدير/استيراد)
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← تخطيط التبويبات (4 تبويبات)
│   │   ├── index.tsx            ← الرئيسية — قائمة المواد
│   │   ├── stats.tsx            ← إحصائياتي — سجل الاختبارات
│   │   ├── bookmarks.tsx        ← المحفوظات — الأسئلة المحفوظة
│   │   └── profile.tsx          ← الإعدادات — مظهر، صوت، مزامنة، بيانات
│   ├── bookmarks/
│   │   └── [questionId].tsx     ← تفاصيل سؤال محفوظ
│   ├── chapter/
│   │   └── [id].tsx             ← تفاصيل الفصل
│   ├── quiz/
│   │   ├── setup.tsx            ← إعداد الاختبار
│   │   ├── play.tsx             ← شاشة الاختبار
│   │   └── result.tsx           ← نتيجة الاختبار
│   └── subject/
│       └── [id].tsx             ← تفاصيل المادة
├── utils/
│   ├── storage.ts               ← التخزين الرئيسي (AsyncStorage)
│   ├── firebase.ts              ← Firebase Auth + Firestore
│   ├── soundManager.ts          ← إدارة الصوت (expo-audio)
│   ├── subjectDataManager.ts    ← بيانات المواد (GitHub + offline)
│   ├── subjects.ts              ← أنواع ومحملات المواد
│   ├── pdfManifest.ts           ← قائمة PDFs من GitHub
│   ├── pdfDownloader.ts         ← تحميل PDFs
│   ├── pdfStorage.ts            ← سجلات تحميل PDF
│   ├── dataTransfer.ts          ← تصدير/استيراد البيانات
│   ├── syncManager.ts           ← مزامنة Firebase
│   ├── theme.ts                 ← ألوان الثيم
│   └── ThemeContext.tsx          ← React Context للثيم
├── components/
│   ├── haptic-tab.tsx           ← تبويب مع اهتزاز
│   └── external-link.tsx        ← رابط خارجي
├── data/subjects/
│   ├── index.json               ← فهرس المواد
│   ├── ai_data.json             ← الذكاء الاصطناعي
│   ├── cn_data.json             ← الشبكات
│   ├── ds_data.json             ← هياكل البيانات
│   ├── oop_data.json            ← البرمجة الكائنية
│   ├── os_data.json             ← أنظمة التشغيل
│   └── se_data.json             ← هندسة البرمجيات
├── assets/
│   ├── sounds/
│   │   ├── correct.mp3          ← صوت الإجابة الصحيحة
│   │   ├── wrong.mp3            ← صوت الإجابة الخاطئة
│   │   └── completed.mp3        ← صوت إكمال الاختبار
│   └── images/
│       ├── icon.png
│       ├── adaptive-icon.png
│       ├── favicon.png
│       └── splash-icon.png
├── app.json                     ← إعدادات Expo
├── eas.json                     ← إعدادات EAS Build
├── package.json                 ← التبعيات
└── tsconfig.json                ← إعدادات TypeScript
```

---

## المواد الدراسية

| الكود | اسم المادة |
|-------|-----------|
| ai_data | الذكاء الاصطناعي |
| cn_data | الشبكات |
| ds_data | هياكل البيانات |
| oop_data | البرمجة الكائنية |
| os_data | أنظمة التشغيل |
| se_data | هندسة البرمجيات |

---

## طبقة البيانات — Offline-First Strategy

### سلسلة الأولوية
1. **ملف محمّل** من GitHub (في `documentDirectory/subject_data/`)
2. **ملف مدمج** في APK (via `require()`)

### GitHub Repo
- **الرابط:** https://github.com/AboALhasanx/quiz-app-data
- **API URL:** `https://api.github.com/repos/AboALhasanx/quiz-app-data/releases/latest`
- **Cache TTL:** 30 دقيقة
- **Release tag:** v1

### رفع بيانات جديدة
```bash
# 1. تحديث ملفات JSON في data/subjects/
# 2. رفع إلى GitHub release v1
# 3. التطبيق يكتشف التحديثات تلقائياً (فحص كل 30 دقيقة)
```

---

## نظام الصوت

### المكتبة
- **expo-audio** (مهاجرة من expo-av)
- التحميل الكسول via `require("expo-audio")` داخل `getPlayer()`

### الدوال المصدّرة من `soundManager.ts`

| الدالة | الوصف |
|--------|-------|
| `loadSoundSettings()` | تحميل إعدادات الصوت من AsyncStorage |
| `loadMuteState()` | alias لـ `loadSoundSettings` (توافق خلفي) |
| `isMuted()` | هل الصوت مكتوم؟ |
| `setMuted(value)` | تعيين حالة الكتم |
| `toggleMute()` | تبديل حالة الكتم |
| `getVolume()` | الحصول على مستوى الصوت (0-1) |
| `setVolume(value)` | تعيين مستوى الصوت |
| `playCorrect()` | تشغيل صوت الإجابة الصحيحة |
| `playWrong()` | تشغيل صوت الإجابة الخاطئة |
| `playCompleted()` | تشغيل صوت إكمال الاختبار |
| `unloadSounds()` | تفريغ جميع الأصوات من الذاكرة |

### AsyncStorage Keys

| المفتاح | النوع | الوصف |
|---------|-------|-------|
| `sound_muted` | `"true"` / `"false"` | حالة كتم الصوت |
| `sound_volume` | `"0.0"` - `"1.0"` | مستوى الصوت |

### مثال استخدام expo-audio
```typescript
const { createAudioPlayer } = require("expo-audio");
const player = createAudioPlayer(require("../assets/sounds/correct.mp3"));
player.volume = 0.8;
player.seekTo(0);
player.play();
```

---

## نظام الثيم

### الملفات
- `utils/theme.ts` — تعريف الألوان (`lightTheme`, `darkTheme`)
- `utils/ThemeContext.tsx` — React Context + AsyncStorage persistence

### الوضعيات
- **داكن** (افتراضي) — خلفية `#0B1C2E`
- **فاتح** — خلفية `#f2f1f0`

### مثال الاستخدام
```typescript
import { useTheme } from "../utils/ThemeContext";

function MyComponent() {
  const { theme, isDark, toggle } = useTheme();
  // theme.background, theme.primary, theme.textPrimary, etc.
  // toggle() لتبديل الوضع
}
```

### AsyncStorage Key
| المفتاح | القيم |
|---------|-------|
| `user_theme` | `"dark"` / `"light"` |

---

## Firebase

### Auth
- تسجيل الدخول بالبريد وكلمة المرور (`signInWithEmailAndPassword`)
- إنشاء حساب (`createAuthUserWithEmailAndPassword`)
- تسجيل الخروج (`signOut`)
- مزامنة تلقائية عند تغيير حالة المصادقة

### Firestore
- **Results:** `users/{uid}/results/{resultId}`
- **Bookmarks:** `users/{uid}/bookmarks/{bookmarkId}`
- **Sync Queue:** طابور محلي يُرفع عند توفر الاتصال

### استراتيجية المزامنة
1. العمليات تُحفظ محلياً أولاً
2. تُضاف إلى طابور المزامنة (`sync_queue`)
3. عند توفر الاتصال: `flushSyncQueue()` يرفع كل شيء
4. مزامنة تلقائية عند العودة للتطبيق (`AppState` listener)

---

## نظام الـ PDF

### المصدر
- **GitHub Repo:** [AboALhasanx/quiz-app-pdfs](https://github.com/AboALhasanx/quiz-app-pdfs)
- **API:** `https://api.github.com/repos/AboALhasanx/quiz-app-pdfs/releases/latest`

### المنطق
1. جلب قائمة PDFs من GitHub API (مع تخزين مؤقت 30 دقيقة)
2. مقارنة الحجم المحلي مع البعيد لتحديد التحديثات
3. حالات: `not_downloaded` | `update_available` | `up_to_date`

### التحميل
- `downloadPdf(entry)` — تحميل إلى `documentDirectory/pdfs/`
- `openPdf(localPath)` — فتح عبر `expo-sharing`

### الحالات في الواجهة
- `idle` — جاهز
- `checking` — جاري الفحص
- `downloading` — جاري التحميل (مع شريط تقدم)
- `done` — اكتمل
- `up_to_date` — محدّث بالفعل
- `error` — فشل

---

## EAS Build Profiles

```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "android": { "buildType": "apk" }
  },
  "preview": {
    "distribution": "internal",
    "environment": "production",
    "android": { "buildType": "apk" }
  },
  "production": {
    "autoIncrement": true,
    "android": { "buildType": "app-bundle" }
  }
}
```

### أمر البناء
```bash
eas build --platform android --profile preview
```

---

## شاشة الاختبار

### أنماط الاختبار
- **Paper (ورقي):** الإجابة على جميع الأسئلة ثم عرض النتيجة
- **Recitation (تسميع):** عرض الإجابة الصحيحة/الخاطئة فوراً بعد كل سؤال

### الميزات الرئيسية
- خلط عشوائي للأسئلة والخيارات
- مؤقت Hard Mode (دقيقة لكل سؤال)
- حفظ واستئناف الجلسة
- حفظ الأسئلة في المحفوظات
- أصوات الإجابة الصحيحة/الخاطئة
- كتم الصوت ومستوى الصوت
- تبديل اللغة (عربي/إنجليزي)
- شريط تقدم
- التنقل بين الأسئلة (السابق/التالي)

---

## شاشة الإعدادات

| القسم | الميزات |
|-------|---------|
| المظهر | تبديل الوضع الليلي/الفاتح |
| الصوت | كتم/تشغيل + شريط مستوى الصوت |
| المزامنة | رفع البيانات المحلية إلى Firebase |
| البيانات | تصدير/استيراد JSON |
| الملفات والمحتوى | تحديث الملازم والملخصات (PDFs + بيانات المواد) |
| الحساب | تسجيل الخروج |

---

## AsyncStorage Keys — جميع المفاتيح

| المفتاح | الملف | الوصف |
|---------|-------|-------|
| `user_theme` | ThemeContext.tsx | `"dark"` / `"light"` |
| `sound_muted` | soundManager.ts | `"true"` / `"false"` |
| `sound_volume` | soundManager.ts | `"0.0"` - `"1.0"` |
| `quiz_results` | storage.ts | مصفوفة نتائج الاختبارات (JSON) |
| `quiz_bookmarks` | storage.ts | مصفوفة الأسئلة المحفوظة (JSON) |
| `topicCompletions` | storage.ts | المواضيع المكتملة |
| `chapterCompletions` | storage.ts | الفصول المكتملة |
| `subjectCompletions` | storage.ts | المواد المكتملة |
| `sync_queue` | storage.ts | طابور مزامنة Firebase |
| `quiz_session` | storage.ts | جلسة الاختبار الحالية |
| `pdf_downloads` | pdfStorage.ts | سجلات تحميل PDF |
| `pdf_manifest_cache` | pdfManifest.ts | cache قائمة PDFs |
| `subject_data_manifest_cache` | subjectDataManager.ts | cache بيانات المواد |

---

## المشاكل المعروفة والـ TODOs

- لا توجد مشاكل معروفة حالياً
- التطبيق يعمل بشكل مستقر على Expo Go

---

## سجل التغييرات الأخيرة

| التاريخ | التغيير |
|---------|---------|
| 2026-04-29 | ترحيل expo-av إلى expo-audio + إضافة شريط مستوى الصوت |
| 2026-04-29 | إنشاء ملفات التوثيق (status.md, about.md) |
| 2026-04-28 | إضافة نظام تحديث الملازم والملخصات (PDFs + بيانات المواد) |
| 2026-04-28 | إضافة مزامنة تلقائية عند العودة للتطبيق |
| 2026-04-28 | إضافة تصدير/استيراد البيانات |
| 2026-04-28 | إضافة شاشة الإعدادات الكاملة |
| 2026-04-28 | إضافة أصوات الاختبار (صحيح، خاطئ، إكمال) |
| 2026-04-28 | إضافة نظام المحفوظات مع فلتر المواد |
| 2026-04-28 | إضافة إحصائيات الاختبارات |

---

## كيفية استخدام هذا الدليل مع نماذج AI أخرى

### التعليمات
1. انسخ محتوى هذا الملف كـ context أولي
2. استخدم `use build` عند تعديل أي ملف
3. اتبع نمط: `→ Read [filename]` ثم `← Edit [filename]`

### قالب الجاهز
```
[محتوى about.md]
---
المهمة: [اكتب طلبك هنا]

عند تعديل الكود، استخدم:
  use build
  → Read [filename]
  ← Edit [filename]

قواعد مهمة:
- لا تحذف أي ملف دون إذن
- تحقق من TypeScript بعد كل تعديل: npx tsc --noEmit
- استخدم القيم الموجودة فعلياً — لا تخمينات
```
