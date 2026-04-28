import AsyncStorage from "@react-native-async-storage/async-storage";

const MUTE_KEY = "sound_muted";

// ── Mute state (in-memory + persisted) ───────────────────────────────────────
let _muted = false;

export async function loadMuteState(): Promise<void> {
  try {
    const val = await AsyncStorage.getItem(MUTE_KEY);
    _muted = val === "true";
  } catch {
    _muted = false;
  }
}

export function isMuted(): boolean {
  return _muted;
}

export async function setMuted(value: boolean): Promise<void> {
  _muted = value;
  try {
    await AsyncStorage.setItem(MUTE_KEY, value ? "true" : "false");
  } catch {
    // ignore
  }
}

export function toggleMute(): boolean {
  const next = !_muted;
  setMuted(next);
  return next;
}

// ── Sound cache ───────────────────────────────────────────────────────────────
const soundCache: Record<string, any> = {};

async function getSound(key: string, asset: number): Promise<any | null> {
  try {
    if (!soundCache[key]) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Audio } = require("expo-av") as typeof import("expo-av");
      const { sound } = await Audio.Sound.createAsync(asset);
      soundCache[key] = sound;
    }
    return soundCache[key];
  } catch {
    return null;
  }
}

// ── Play helpers ──────────────────────────────────────────────────────────────
async function play(key: string, asset: number): Promise<void> {
  if (_muted) return;
  try {
    const sound = await getSound(key, asset);
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // ignore sound errors — never crash the app
  }
}

export async function playCorrect(): Promise<void> {
  await play("correct", require("../assets/sounds/correct.mp3"));
}

export async function playWrong(): Promise<void> {
  await play("wrong", require("../assets/sounds/wrong.mp3"));
}

export async function playCompleted(): Promise<void> {
  await play("completed", require("../assets/sounds/completed.mp3"));
}

// ── Unload all sounds (call on app background) ────────────────────────────────
export async function unloadSounds(): Promise<void> {
  for (const key of Object.keys(soundCache)) {
    try {
      if (soundCache[key]) {
        await soundCache[key].unloadAsync();
      }
      delete soundCache[key];
    } catch {
      // ignore
    }
  }
}
