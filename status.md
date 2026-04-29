# Project Status — 2026-04-29

## Stack
- Expo SDK: ~55.0.9
- React Native: 0.83.2
- expo-av: ^16.0.8 ⚠️ deprecated → migrate to expo-audio
- expo-audio: no
- expo-router: ~55.0.8
- EAS Build: development, preview, production
- Target: Android APK (preview profile)

## Screens & Routes
| File | Description |
|------|-------------|
| `app/_layout.tsx` | Root layout — auth gate, theme provider, stack navigator |
| `app/+not-found.tsx` | 404 fallback screen |
| `app/login.tsx` | Email/password login & registration |
| `app/settings.tsx` | Settings screen (sync, export/import, sound toggle) |
| `app/(tabs)/_layout.tsx` | Tab bar layout — 4 tabs: Home, Stats, Bookmarks, Profile |
| `app/(tabs)/index.tsx` | Home tab — subject list with last quiz result per subject |
| `app/(tabs)/stats.tsx` | Stats tab — quiz history, per-subject filter, clear all |
| `app/(tabs)/bookmarks.tsx` | Bookmarks tab — saved questions, subject filter, start quiz |
| `app/(tabs)/profile.tsx` | Profile/Settings tab — theme, sound, sync, export/import, logout |
| `app/bookmarks/[questionId].tsx` | Bookmark detail — view saved question with answer |
| `app/chapter/[id].tsx` | Chapter detail — topics list, progress, start quiz, PDF buttons |
| `app/quiz/setup.tsx` | Quiz setup — mode, order, hard mode, percentage, start |
| `app/quiz/play.tsx` | Quiz play — questions, timer, bookmarks, sound, prev/next nav |
| `app/quiz/result.tsx` | Quiz result — score, review, save, completion sound |
| `app/subject/[id].tsx` | Subject detail — chapters list, progress, start quiz |

## Utils & Services
| File | Description |
|------|-------------|
| `utils/dataTransfer.ts` | Export/import all data as JSON via expo-sharing |
| `utils/firebase.ts` | Firebase auth, Firestore CRUD, sync queue |
| `utils/pdfDownloader.ts` | Download PDFs from GitHub releases, open via expo-sharing |
| `utils/pdfManifest.ts` | Fetch PDF manifest from GitHub API, cache, status check |
| `utils/pdfStorage.ts` | AsyncStorage CRUD for PDF download records |
| `utils/soundManager.ts` | Sound effects (correct/wrong/completed), mute toggle, lazy expo-av |
| `utils/sounds.ts` | Legacy sound file (unused, kept for reference) |
| `utils/storage.ts` | Core storage — results, bookmarks, completions, sync queue, session |
| `utils/subjectDataManager.ts` | GitHub-backed subject data with offline-first fallback |
| `utils/subjects.ts` | Subject data types, loaders, question helpers |
| `utils/syncManager.ts` | Flush all local data to Firebase on network restore |
| `utils/theme.ts` | Light/dark theme color definitions |
| `utils/ThemeContext.tsx` | React context for theme, persisted via AsyncStorage |

## Components
| File | Description |
|------|-------------|
| `components/external-link.tsx` | External URL opener with expo-web-browser |
| `components/haptic-tab.tsx` | Tab bar with haptic feedback on press |

## Data Layer
- Subject files: `ai_data.json`, `cn_data.json`, `ds_data.json`, `oop_data.json`, `os_data.json`, `se_data.json`, `index.json`
- GitHub Repo: AboALhasanx/quiz-app-data
- Release: v1
- Strategy: offline-first (bundled → downloaded)

## Sound System
- Library: expo-av (lazy-loaded via require)
- Manager: `utils/soundManager.ts`
- Mute key: `"sound_muted"` (AsyncStorage)
- Volume key: not implemented
- Features: mute toggle ✅ / volume slider ❌

## Known Issues / TODOs
- [ ] Migrate expo-av → expo-audio (expo-av deprecated in SDK 55)
- [ ] Add volume slider to settings
- [ ] `utils/sounds.ts` is unused — consider removing
- [ ] `app/settings.tsx` is a legacy stack screen — consider consolidating with `app/(tabs)/profile.tsx`

## Last APK Build
- Profile: preview
- Status: ✅ built successfully
