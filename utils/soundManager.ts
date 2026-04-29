/**
 * soundManager.ts
 * Migrated from expo-av → expo-audio (Expo SDK 55)
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const MUTE_KEY   = "sound_muted";
const VOLUME_KEY = "sound_volume";

let _muted  = false;
let _volume = 1.0;

// ── Persist ───────────────────────────────────────────────────────────────────
export async function loadSoundSettings(): Promise<void> {
  try {
    const [m, v] = await Promise.all([
      AsyncStorage.getItem(MUTE_KEY),
      AsyncStorage.getItem(VOLUME_KEY),
    ]);
    if (m !== null) _muted  = m === "true";
    if (v !== null) _volume = parseFloat(v);
  } catch { /* ignore */ }
}

async function saveSoundSettings(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(MUTE_KEY,   String(_muted)),
      AsyncStorage.setItem(VOLUME_KEY, String(_volume)),
    ]);
  } catch { /* ignore */ }
}

// ── Backward compat alias (used in play.tsx) ─────────────────────────────────
export const loadMuteState = loadSoundSettings;

// ── Mute ──────────────────────────────────────────────────────────────────────
export function isMuted(): boolean { return _muted; }

export async function setMuted(value: boolean): Promise<void> {
  _muted = value;
  await saveSoundSettings();
}

export async function toggleMute(): Promise<void> {
  await setMuted(!_muted);
}

// ── Volume ────────────────────────────────────────────────────────────────────
export function getVolume(): number { return _volume; }

export async function setVolume(value: number): Promise<void> {
  _volume = Math.max(0, Math.min(1, value));
  await saveSoundSettings();
}

// ── Sound cache ───────────────────────────────────────────────────────────────
const soundCache: Record<string, any> = {};

async function getPlayer(key: string, asset: number): Promise<any | null> {
  try {
    if (!soundCache[key]) {
      const { createAudioPlayer } = require("expo-audio");
      const player = createAudioPlayer(asset);
      soundCache[key] = player;
    }
    return soundCache[key];
  } catch {
    return null;
  }
}

// ── Play ──────────────────────────────────────────────────────────────────────
async function play(key: string, asset: number): Promise<void> {
  if (_muted) return;
  try {
    const player = await getPlayer(key, asset);
    if (!player) return;
    player.volume = _volume;
    player.seekTo(0);
    player.play();
  } catch { /* never crash the app */ }
}

// ── Public API ────────────────────────────────────────────────────────────────
export const playCorrect   = () => play("correct",   require("../assets/sounds/correct.mp3"));
export const playWrong     = () => play("wrong",     require("../assets/sounds/wrong.mp3"));
export const playCompleted = () => play("completed", require("../assets/sounds/completed.mp3"));

// ── Unload ────────────────────────────────────────────────────────────────────
export function unloadSounds(): void {
  for (const key of Object.keys(soundCache)) {
    try { soundCache[key]?.remove?.(); } catch { /* ignore */ }
    delete soundCache[key];
  }
}
