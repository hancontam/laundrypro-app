// src/theme/tokens.ts
// ─── Design Tokens — Extracted from SPEC_DESIGN.md ───────────────
// Single source of truth for all design values.
// React Native style objects for things NativeWind can't handle.

import { TextStyle, ViewStyle } from 'react-native';

// ─── Colors (§2) ────────────────────────────────────────────────
export const Colors = {
  // Structural
  page: '#F8F9FB',
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  // Accent / Brand
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo900: '#312E81',
  // State
  red50: '#FEF2F2',
  red600: '#DC2626',
  green500: '#22C55E',
  green600: '#16A34A',
} as const;

// ─── Shadows (§5.5) ────────────────────────────────────────────
// NativeWind shadow utilities don't work reliably on Android.
// Use these style objects on containers that need shadows.

/** §5.2 Full-Width Submit / CTA button: shadow-lg shadow-slate-900/20 */
export const shadowCTA: ViewStyle = {
  shadowColor: Colors.slate900,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.2,
  shadowRadius: 15,
  elevation: 8,
};

/** §5.1 Standard list card: shadow-sm */
export const shadowCard: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
};

/** §5.2 Icon button / floating element: shadow-lg shadow-slate-900/10 */
export const shadowFloating: ViewStyle = {
  shadowColor: Colors.slate900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 4,
};

/** §5.2 Outline button: shadow-lg shadow-slate-900/10 */
export const shadowOutline: ViewStyle = {
  shadowColor: Colors.slate900,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 15,
  elevation: 5,
};

// ─── Border Radii (§5.4) ────────────────────────────────────────
export const Radii = {
  lg: 8,    // color picker, logos
  xl: 12,   // buttons, inputs
  '2xl': 16, // cards
  '3xl': 24, // modals
  full: 9999,
} as const;

// ─── Typography (§3) ────────────────────────────────────────────
// Plus Jakarta Sans applied globally via AppText.
// These are supplementary style helpers.

/** §3.3 Uppercase meta label pattern */
export const labelStyle: TextStyle = {
  fontSize: 12,
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: 1, // tracking-wider ≈ 0.05em at 12px ≈ 0.6, we use 1 for visibility
};

// ─── Layout (§7.1) ──────────────────────────────────────────────
/** Single centered column max-w-2xl (672px) for tablet/web */
export const layoutContainer: ViewStyle = {
  width: '100%',
  maxWidth: 672,
  alignSelf: 'center',
};

// ─── Press scale (§5.7) ─────────────────────────────────────────
/** Pressable style helper for active:scale-[0.98] */
export function pressedStyle(pressed: boolean): ViewStyle {
  return {
    transform: [{ scale: pressed ? 0.98 : 1 }],
  };
}

/** Pressable style for small buttons: active:scale-95 */
export function pressedStyleSmall(pressed: boolean): ViewStyle {
  return {
    transform: [{ scale: pressed ? 0.95 : 1 }],
  };
}

// ─── Gradient helpers (§2.4) ────────────────────────────────────
/** 135deg diagonal for LinearGradient */
export const gradient135 = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;
