// ─── Design Tokens — Extracted from SPEC_DESIGN.md ───────────────
// Single source of truth for all design values.
// React Native style objects for things NativeWind can't handle.
// ─── Colors (§2) ────────────────────────────────────────────────
export const Colors = {
    // Background / surfaces
    page: '#FFFFFF',
    paper: '#FFFFFF',
    white: '#FFFFFF',
    // Text
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    // Primary
    primaryLight: '#60A5FA',
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    // Secondary
    secondaryLight: '#5EEAD4',
    secondary: '#14B8A6',
    secondaryDark: '#0F766E',
    // Semantic states
    successLight: '#4ADE80',
    success: '#16A34A',
    warningLight: '#FBBF24',
    warning: '#F59E0B',
    errorLight: '#F87171',
    error: '#EF4444',
    // Backwards-compatible neutral aliases used across the app
    slate50: '#FFFFFF',
    slate100: '#F8FAFC',
    slate200: '#E2E8F0',
    slate300: '#CBD5E1',
    slate400: '#94A3B8',
    slate500: '#64748B',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1E293B',
    slate900: '#0F172A',
    // Backwards-compatible accent aliases used across the app
    indigo50: '#DBEAFE',
    indigo100: '#BFDBFE',
    indigo200: '#93C5FD',
    indigo500: '#60A5FA',
    indigo600: '#2563EB',
    indigo700: '#1D4ED8',
    indigo900: '#1E3A8A',
    // Backwards-compatible semantic aliases
    red50: '#FEF2F2',
    red200: '#FECACA',
    red600: '#EF4444',
    red700: '#DC2626',
    green50: '#F0FDF4',
    green500: '#16A34A',
    green600: '#16A34A',
    green700: '#15803D',
    amber50: '#FFFBEB',
    amber500: '#F59E0B',
};
// ─── Shadows (§5.5) ────────────────────────────────────────────
// NativeWind shadow utilities don't work reliably on Android.
// Use these style objects on containers that need shadows.
/** §5.2 Full-Width Submit / CTA button: shadow-lg shadow-slate-900/20 */
export const shadowCTA = {
    shadowColor: Colors.slate900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
};
/** §5.1 Standard list card: shadow-sm */
export const shadowCard = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
};
/** §5.2 Icon button / floating element: shadow-lg shadow-slate-900/10 */
export const shadowFloating = {
    shadowColor: Colors.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
};
/** §5.2 Outline button: shadow-lg shadow-slate-900/10 */
export const shadowOutline = {
    shadowColor: Colors.slate900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
};
// ─── Border Radii (§5.4) ────────────────────────────────────────
export const Radii = {
    lg: 8, // color picker, logos
    xl: 12, // buttons, inputs
    '2xl': 16, // cards
    '3xl': 24, // modals
    full: 9999,
};
// ─── Typography (§3) ────────────────────────────────────────────
// Plus Jakarta Sans applied globally via AppText.
// These are supplementary style helpers.
/** §3.3 Uppercase meta label pattern */
export const labelStyle = {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1, // tracking-wider ≈ 0.05em at 12px ≈ 0.6, we use 1 for visibility
};
// ─── Layout (§7.1) ──────────────────────────────────────────────
/** Single centered column max-w-2xl (672px) for tablet/web */
export const layoutContainer = {
    width: '100%',
    maxWidth: 672,
    alignSelf: 'center',
};
// ─── Press scale (§5.7) ─────────────────────────────────────────
/** Pressable style helper for active:scale-[0.98] */
export function pressedStyle(pressed) {
    return {
        transform: [{ scale: pressed ? 0.98 : 1 }],
    };
}
/** Pressable style for small buttons: active:scale-95 */
export function pressedStyleSmall(pressed) {
    return {
        transform: [{ scale: pressed ? 0.95 : 1 }],
    };
}
// ─── Gradient helpers (§2.4) ────────────────────────────────────
/** 135deg diagonal for LinearGradient */
export const gradient135 = {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
};
