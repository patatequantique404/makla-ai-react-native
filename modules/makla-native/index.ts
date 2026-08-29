import { requireNativeModule } from 'expo-modules-core';

type MaklaNativeModule = {
  getLegacyLocalState(): string;
  getLegacyCloudState(): string;
  getCloudString(key: string): string | null;
  setCloudString(key: string, value: string): void;
  updateIntentSnapshot(
    eaten: number,
    target: number,
    protein: number,
    carbs: number,
    fat: number,
    targetProtein: number,
    targetCarbs: number,
    targetFat: number,
  ): void;
  consumeOpenScannerIntent(): boolean;
};

export default requireNativeModule<MaklaNativeModule>('MaklaNative');
