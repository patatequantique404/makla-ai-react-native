# Makla AI React Native

Application de suivi nutritionnel construite avec React Native et Expo.

## Parité fonctionnelle

- onboarding page par page, retours, sélections multiples, calcul animé et résumé du plan;
- paywall annuel/hebdomadaire, restauration RevenueCat et accès web par email;
- dashboard, anneaux calories/protéines/glucides/lipides et historique réel;
- scanner intégré à l'app, fermeture immédiate après la photo et analyse en arrière-plan;
- ajout automatique au journal sans écran de confirmation obligatoire;
- progrès et courbe de poids réels en kilogrammes ou en livres;
- barre vitrée native iOS 26 avec le scanner centré entre Progrès et Journal;
- profil, rappels, neuf langues, liens légaux et gestion des abonnements;
- HealthKit sur iOS et Health Connect sur Android pour importer le poids et exporter les données;
- widget WidgetKit iOS (petit, moyen et écran verrouillé) synchronisé avec le dashboard;
- raccourcis Siri pour consulter les calories/macros restantes et ouvrir directement le scanner;
- synchronisation iCloud légère et reprise automatique des données de l'ancienne version Swift;
- mise en page adaptative iPhone, iPad et Android.

## Prérequis

- Node.js 20 ou plus récent;
- Xcode et CocoaPods pour iOS;
- JDK 17 et Android SDK 36 pour Android.

## Configuration

```sh
cp .env.example .env.local
npm install
npx expo prebuild --platform all
```

Variables publiques attendues dans `.env.local` :

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- `EXPO_PUBLIC_EAS_PROJECT_ID` pour les builds EAS

Configurez les clés SDK RevenueCat uniquement dans votre fichier local `.env.local` ou dans les
variables chiffrées de votre service de build. Les clés Stripe, OpenRouter et autres secrets serveur
ne doivent jamais être ajoutés à ce dépôt.

## Lancement

```sh
npm run ios
npm run android
```

Le paywall est contourné uniquement dans les builds de développement. Pour le tester réellement :

```sh
EXPO_PUBLIC_REQUIRE_PAYWALL=1 npm run ios
```

## Vérifications

```sh
npm run typecheck
npm run doctor
npm run build:ios:simulator
npm run build:android:debug
npm run build:android:release
```

Le bundle Android de production est généré dans
`android/app/build/outputs/bundle/release/app-release.aab`. La signature Play Store définitive et
les produits RevenueCat Android nécessitent les identifiants du compte Google Play du propriétaire.

### Signature Android

Sans configuration supplémentaire, `bundleRelease` utilise volontairement la clé de développement
et produit seulement un AAB local de validation. Pour créer un AAB accepté par Google Play, placer
les quatre valeurs suivantes dans `~/.gradle/gradle.properties` (jamais dans Git) :

```properties
MAKLA_UPLOAD_STORE_FILE=/chemin/absolu/vers/makla-upload.jks
MAKLA_UPLOAD_STORE_PASSWORD=mot-de-passe-du-keystore
MAKLA_UPLOAD_KEY_ALIAS=makla-upload
MAKLA_UPLOAD_KEY_PASSWORD=mot-de-passe-de-la-cle
```

Relancer ensuite `npm run build:android:release`. Le projet sélectionne automatiquement cette clé
d'upload quand les quatre valeurs sont présentes.

Le build iOS conserve le bundle identifier `com.webrange.fitora` afin de remplacer l'application
Swift existante sans créer une nouvelle fiche App Store.

## Capacités natives

Le module Expo local `modules/makla-native` conserve les intégrations qui n'ont pas d'équivalent
JavaScript complet : App Intents/Siri, données partagées avec le widget, iCloud KVS et migration des
préférences de l'ancienne application Swift. Ne supprimez pas ce module et ne changez pas les
identifiants suivants lors d'un `expo prebuild` :

- application : `com.webrange.fitora`;
- widget : `com.webrange.fitora.MaklaWidget`;
- App Group : `group.com.webrange.fitora`;
- équipe Apple : `SRQJ2ZKD64`.

La migration Swift est exécutée une seule fois quand aucun état React Native n'existe encore. Les
repas terminés, miniatures, objectifs, poids, langue et état d'onboarding sont restaurés localement;
le petit état auparavant conservé dans iCloud KVS est également repris.

## Contrôle avant publication

1. Exécuter `npm run typecheck` et `npm run doctor`.
2. Tester une mise à jour par-dessus la version Swift sur un appareil qui contient déjà des repas.
3. Tester le scanner sur un appareil physique iOS et Android, puis vérifier l'ajout automatique.
4. Tester achat, restauration et accès web avec les clés RevenueCat de production.
5. Vérifier le widget, les raccourcis Siri, HealthKit et Health Connect sur appareils physiques.
6. Générer l'archive iOS et le fichier `app-release.aab`, puis effectuer les tests TestFlight et
   Google Play internes avant toute mise en production.
