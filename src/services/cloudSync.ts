import { readNativeCloudString, writeNativeCloudString } from './nativeBridge';

const CLOUD_KEY = 'makla.cloud-state.v2';

export function readCloudState<T>(): T | null {
  try {
    const raw = readNativeCloudString(CLOUD_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCloudState(value: object): void {
  try {
    writeNativeCloudString(CLOUD_KEY, JSON.stringify(value));
  } catch {
    // iCloud KVS is best-effort and unavailable on Android or signed-out devices.
  }
}
