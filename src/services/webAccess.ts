import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from './config';

const TOKEN_KEY = 'makla.webAccess.token';
const EMAIL_KEY = 'makla.webAccess.email';
const DEVICE_KEY = 'makla.webAccess.deviceID';

export type WebAccessSnapshot = {
  active: boolean;
  email: string;
};

export async function storedWebAccess(): Promise<WebAccessSnapshot> {
  const [token, email] = await Promise.all([
    secureGet(TOKEN_KEY),
    secureGet(EMAIL_KEY),
  ]);
  return { active: Boolean(token), email: email ?? '' };
}

export async function connectWebAccess(rawEmail: string): Promise<WebAccessSnapshot> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) throw new Error('Enter a valid email.');
  const deviceId = await deviceID();
  const response = await fetch(apiUrl('/api/web/auth-verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      code: null,
      deviceId,
      deviceName: `${Platform.OS} · ${Platform.Version}`,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    token?: string;
    active?: boolean;
    error?: string;
  };
  if (!response.ok || !payload.active || !payload.token) {
    if (response.status === 409) throw new Error('This subscription is already linked to another phone.');
    if (response.status === 403) throw new Error('No active web subscription was found for this email.');
    throw new Error(payload.error || 'Unable to connect this email.');
  }
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, payload.token),
    SecureStore.setItemAsync(EMAIL_KEY, email),
  ]);
  return { active: true, email };
}

export async function refreshWebAccess(): Promise<WebAccessSnapshot> {
  const token = await secureGet(TOKEN_KEY);
  if (!token) return { active: false, email: '' };
  const deviceId = await deviceID();

  try {
    const response = await fetch(apiUrl('/api/web/entitlement'), {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Makla-Device-ID': deviceId,
      },
    });
    const payload = (await response.json().catch(() => ({}))) as {
      active?: boolean;
      email?: string;
    };
    if (response.ok && payload.active) {
      if (payload.email) await SecureStore.setItemAsync(EMAIL_KEY, payload.email);
      return { active: true, email: payload.email ?? '' };
    }
    if (response.status === 401 || response.status === 409 || !payload.active) {
      await clearWebAccess();
      return { active: false, email: '' };
    }
  } catch {
    const cached = await storedWebAccess();
    return cached;
  }

  return storedWebAccess();
}

export async function billingPortalUrl(): Promise<string> {
  const token = await secureGet(TOKEN_KEY);
  if (!token) throw new Error('Connect your web purchase email first.');
  const response = await fetch(apiUrl('/api/web/billing-portal'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Makla-Device-ID': await deviceID(),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !payload.url) throw new Error(payload.error || 'Unable to open subscription management.');
  return payload.url;
}

export async function clearWebAccess(): Promise<void> {
  await Promise.all([
    secureDelete(TOKEN_KEY),
    secureDelete(EMAIL_KEY),
  ]);
}

async function deviceID(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_KEY);
  if (stored) return stored;

  const legacyStored = await secureGet(DEVICE_KEY);
  if (legacyStored) {
    await AsyncStorage.setItem(DEVICE_KEY, legacyStored);
    return legacyStored;
  }

  const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(DEVICE_KEY, generated);
  return generated;
}

async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    // Unsigned simulators and devices with a temporarily locked Keychain must
    // still be able to open the app; only web entitlement recovery is skipped.
    return null;
  }
}

async function secureDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Clearing an unavailable Keychain item is already the desired state.
  }
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
