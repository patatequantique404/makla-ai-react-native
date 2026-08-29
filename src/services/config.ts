import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
  revenueCatEntitlementId?: string;
  revenueCatIosApiKey?: string;
  revenueCatAndroidApiKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const appConfig = {
  apiBaseUrl: (extra.apiBaseUrl || 'https://www.makla-ai.com').replace(/\/$/, ''),
  revenueCatEntitlementId: extra.revenueCatEntitlementId || 'pro',
  revenueCatIosApiKey: extra.revenueCatIosApiKey || '',
  revenueCatAndroidApiKey: extra.revenueCatAndroidApiKey || '',
  weeklyProductId: 'com.webrange.fitora.pro.weekly',
  yearlyProductId: 'com.webrange.fitora.pro.yearly',
  appleSubscriptionsUrl: 'https://apps.apple.com/account/subscriptions',
  privacyUrl: 'https://www.makla-ai.com/privacy',
  termsUrl: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  supportUrl: 'https://www.makla-ai.com/support',
} as const;

export function apiUrl(path: string): string {
  return `${appConfig.apiBaseUrl}/${path.replace(/^\//, '')}`;
}
