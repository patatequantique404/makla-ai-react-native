import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { appConfig } from '../services/config';
import {
  billingPortalUrl,
  clearWebAccess,
  connectWebAccess,
  refreshWebAccess,
  storedWebAccess,
} from '../services/webAccess';
import { t } from '../i18n';

type AccessContextValue = {
  ready: boolean;
  isLoading: boolean;
  hasAccess: boolean;
  isSubscribed: boolean;
  hasWebAccess: boolean;
  webEmail: string;
  packages: PurchasesPackage[];
  message: string | null;
  purchase: (aPackage: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
  connectEmail: (email: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  signOutWeb: () => Promise<void>;
  getBillingPortalUrl: () => Promise<string | null>;
};

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: React.PropsWithChildren): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isSubscribed, setSubscribed] = useState(false);
  const [hasWebAccess, setWebAccess] = useState(false);
  const [webEmail, setWebEmail] = useState('');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const applyCustomerInfo = useCallback((info: CustomerInfo) => {
    setSubscribed(Boolean(info.entitlements.active[appConfig.revenueCatEntitlementId]));
  }, []);

  const refresh = useCallback(async () => {
    const web = await refreshWebAccess();
    setWebAccess(web.active);
    setWebEmail(web.email);
    try {
      const info = await Purchases.getCustomerInfo();
      applyCustomerInfo(info);
    } catch {
      // Offline users keep their cached web access and RevenueCat refreshes next time.
    }
  }, [applyCustomerInfo]);

  useEffect(() => {
    let mounted = true;
    const customerListener = (info: CustomerInfo) => applyCustomerInfo(info);
    void (async () => {
      const apiKey = Platform.OS === 'ios' ? appConfig.revenueCatIosApiKey : appConfig.revenueCatAndroidApiKey;
      try {
        if (apiKey) {
          Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
          Purchases.configure({ apiKey });
          Purchases.addCustomerInfoUpdateListener(customerListener);
          const [offerings, info] = await Promise.all([
            Purchases.getOfferings(),
            Purchases.getCustomerInfo(),
          ]);
          if (mounted) {
            const available = offerings.current?.availablePackages ?? [];
            setPackages(
              [...available].sort((left, right) => {
                if (left.product.identifier === appConfig.yearlyProductId) return -1;
                if (right.product.identifier === appConfig.yearlyProductId) return 1;
                return right.product.price - left.product.price;
              }),
            );
            applyCustomerInfo(info);
          }
        }
      } catch {
        if (mounted) setMessage(t('Impossible de charger les abonnements pour le moment.'));
      }

      const web = await storedWebAccess();
      if (mounted) {
        setWebAccess(web.active);
        setWebEmail(web.email);
        setReady(true);
      }
      if (web.active) await refresh();
    })();

    return () => {
      mounted = false;
      try {
        Purchases.removeCustomerInfoUpdateListener(customerListener);
      } catch {
        // The SDK may not have been configured on this platform yet.
      }
    };
  }, [applyCustomerInfo, refresh]);

  const purchase = useCallback(async (aPackage: PurchasesPackage) => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await Purchases.purchasePackage(aPackage);
      applyCustomerInfo(result.customerInfo);
      setMessage(t('Makla AI Pro actif'));
    } catch (error) {
      const purchaseError = error as { userCancelled?: boolean; message?: string };
      if (!purchaseError.userCancelled) {
        setMessage(purchaseError.message || t('Le paiement a échoué. Réessaie dans quelques instants.'));
      }
    } finally {
      setLoading(false);
    }
  }, [applyCustomerInfo]);

  const restore = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const info = await Purchases.restorePurchases();
      applyCustomerInfo(info);
      setMessage(Boolean(info.entitlements.active[appConfig.revenueCatEntitlementId]) ? t('Abonnement restauré.') : t('Aucun abonnement actif trouvé.'));
    } catch {
      setMessage(t('La restauration n’a pas pu être effectuée.'));
    } finally {
      setLoading(false);
    }
  }, [applyCustomerInfo]);

  const connectEmail = useCallback(async (email: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await connectWebAccess(email);
      setWebAccess(result.active);
      setWebEmail(result.email);
      setMessage(t('Accès Pro activé sur ce téléphone.'));
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('Impossible de connecter cet email.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutWeb = useCallback(async () => {
    await clearWebAccess();
    setWebAccess(false);
    setWebEmail('');
    setMessage(t('Accès web déconnecté.'));
  }, []);

  const getBillingPortalUrl = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      return await billingPortalUrl();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Impossible d'ouvrir la gestion de l'abonnement."));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const debugBypass = __DEV__ && process.env.EXPO_PUBLIC_REQUIRE_PAYWALL !== '1';
  const value = useMemo<AccessContextValue>(() => ({
    ready,
    isLoading,
    hasAccess: debugBypass || isSubscribed || hasWebAccess,
    isSubscribed,
    hasWebAccess,
    webEmail,
    packages,
    message,
    purchase,
    restore,
    connectEmail,
    refresh,
    signOutWeb,
    getBillingPortalUrl,
  }), [
    ready,
    isLoading,
    debugBypass,
    isSubscribed,
    hasWebAccess,
    webEmail,
    packages,
    message,
    purchase,
    restore,
    connectEmail,
    refresh,
    signOutWeb,
    getBillingPortalUrl,
  ]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessContextValue {
  const value = useContext(AccessContext);
  if (!value) throw new Error('useAccess must be used inside AccessProvider');
  return value;
}
