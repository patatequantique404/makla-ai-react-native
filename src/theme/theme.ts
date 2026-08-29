import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  ink: '#0D3B21',
  mutedInk: '#668572',
  softInk: '#ADADB8',
  paper: '#FFFFFF',
  panel: '#FBFBFE',
  elevatedPanel: '#FFFFFF',
  line: 'rgba(0,0,0,0.075)',
  strongLine: 'rgba(0,0,0,0.24)',
  inverseInk: '#FFFFFF',
  leaf: '#10B033',
  mint: '#CCF2E3',
  tomato: '#DE575F',
  sky: '#598FDB',
  gold: '#E8914A',
  green: '#4AB389',
  brand: '#10B033',
  danger: '#D63F46',
} as const;

export const radii = {
  card: 24,
  control: 30,
  sheet: 32,
} as const;

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 5 },
    default: {},
  }),
  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: 0.14,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 14 },
    },
    android: { elevation: 9 },
    default: {},
  }),
} as const;

export const typography = {
  display: { fontSize: 40, fontWeight: '900', letterSpacing: 0 } satisfies TextStyle,
  screenTitle: { fontSize: 42, fontWeight: '900', letterSpacing: 0 } satisfies TextStyle,
  sectionTitle: { fontSize: 24, fontWeight: '800', letterSpacing: 0 } satisfies TextStyle,
  title: { fontSize: 20, fontWeight: '800', letterSpacing: 0 } satisfies TextStyle,
  body: { fontSize: 16, fontWeight: '500', letterSpacing: 0 } satisfies TextStyle,
  caption: { fontSize: 13, fontWeight: '600', letterSpacing: 0 } satisfies TextStyle,
} as const;

export const layout = {
  contentMaxWidth: 720,
  horizontalPadding: 20,
  tabBarHeight: 76,
  scanButtonSize: 68,
} as const;
