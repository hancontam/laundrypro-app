---
name: spec-design
---

# LaundryPro — Design System Specification

> **Product**: LaundryPro — Laundry Service Mobile App  
> **Stack**: Expo SDK 55 + React Native + TypeScript + NativeWind + Redux Toolkit  
> **Runtime**: Expo Go (no custom native modules)  
> **Last Updated**: 2026-02-27  
> **Purpose**: This document codifies the complete visual design system for LaundryPro so that any AI or developer can replicate the exact same design style. All new screens and components **must** follow these rules.

---

## 1. Design Philosophy

### Visual Identity

LaundryPro follows a **Soft Minimal** design philosophy — clean, light, spacious, with pastel-gradient accents. The aesthetic sits at the intersection of **Apple HIG-inspired minimalism** and **modern SaaS dashboard clarity**.

### Core Principles

| Principle | Implementation |
|---|---|
| **Light & Airy** | Near-white background (`#F8F9FB`), generous whitespace, no heavy borders |
| **Typographic Hierarchy** | Weight-driven hierarchy using Plus Jakarta Sans at 400–800 |
| **Pastel Gradients** | Soft bg→accent gradients (indigo-50→indigo-200) for brand elements only |
| **Rounded Everything** | Radii from `rounded-xl` (12px) to `rounded-3xl` (24px); no sharp corners |
| **Subtle Motion** | Pressable `scale(0.98)` on press; no CSS transitions (RN doesn't support them) |
| **Progressive Disclosure** | Step wizard, bottom sheets, validation hints that guide the user |

### What This Is NOT

- ❌ Not dark mode / neon / cyberpunk
- ❌ Not glassmorphism-heavy (only on modal overlays if needed)
- ❌ Not gradient-heavy on structural UI (gradients only on brand logo + data viz)
- ❌ Not animation-heavy — press feedback is tasteful and minimal
- ❌ Not a sidebar/tab layout on auth screens — single centered column

---

## 2. Color Palette

### 2.1 Structural Colors

| Token | Hex | NativeWind Class | Usage |
|---|---|---|---|
| `page` | `#F8F9FB` | `bg-page` | Page background |
| `white` | `#FFFFFF` | `bg-white` | Cards, modals, inputs |
| `slate-50` | `#F8FAFC` | `bg-slate-50` | Input backgrounds, secondary surfaces |
| `slate-100` | `#F1F5F9` | `bg-slate-100` / `border-slate-100` | Close buttons, card borders |
| `slate-200` | `#E2E8F0` | `border-slate-200` | Input borders, separators |
| `slate-300` | `#CBD5E1` | — | Placeholder text color (via `placeholderTextColor`) |
| `slate-400` | `#94A3B8` | `text-slate-400` | Muted text, icons |
| `slate-500` | `#64748B` | `text-slate-500` | Labels, descriptions |
| `slate-600` | `#475569` | `text-slate-600` | Secondary body text |
| `slate-700` | `#334155` | `text-slate-700` | Secondary button text |
| `slate-800` | `#1E293B` | `text-slate-800` | Body text |
| `slate-900` | `#0F172A` | `text-slate-900` / `bg-slate-900` | Primary text, CTA button bg |

### 2.2 Accent / Brand Colors

| Token | Hex | NativeWind Class | Usage |
|---|---|---|---|
| `indigo-50` | `#EEF2FF` | `bg-indigo-50` | Icon circle background, OTP filled cell |
| `indigo-100` | `#E0E7FF` | — | Focus ring color |
| `indigo-200` | `#C7D2FE` | — | Gradient accent end |
| `indigo-500` | `#6366F1` | — | OTP active border, focus ring |
| `indigo-600` | `#4F46E5` | `text-indigo-600` | Links, accent text, icon color |
| `indigo-900` | `#312E81` | — | Text selection foreground |

### 2.3 State Colors

| State | Implementation |
|---|---|
| **Error background** | `bg-red-50` (`#FEF2F2`) |
| **Error text** | `text-red-600` (`#DC2626`) |
| **Success icon** | `#22C55E` (green-500, fill) |
| **Success text** | `text-green-600` |
| **Disabled** | `opacity: 0.5` via `Pressable` style |
| **Pressed (CTA)** | `scale(0.98)` via `pressedStyle()` |
| **Pressed (small)** | `scale(0.95)` via `pressedStyleSmall()` |

### 2.4 Brand Gradient

| Property | Value |
|---|---|
| **Direction** | 135deg diagonal |
| **Colors** | `['#EEF2FF', '#C7D2FE']` (indigo-50 → indigo-200) |
| **React Native** | `<LinearGradient colors={[...]} start={{x:0,y:0}} end={{x:1,y:1}}>` |
| **Package** | `expo-linear-gradient` |

> **Rule**: Web CSS `135deg` = React Native `start={{x:0,y:0}} end={{x:1,y:1}}`. Use `gradient135` from `tokens.ts`.

### 2.5 Custom Tailwind Colors

Defined in `tailwind.config.js`:

| Token | Hex |
|---|---|
| `page` | `#F8F9FB` |
| `brand-purple` | `#E5DEFF` |
| `brand-yellow` | `#FFF4C3` |
| `brand-orange` | `#FFDCC2` |
| `brand-cyan` | `#C6F6F6` |
| `brand-dark` | `#0F172A` |

---

## 3. Typography

### 3.1 Font Family

```
Plus Jakarta Sans — Google Fonts
Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
```

**Loading**: via `@expo-google-fonts/plus-jakarta-sans` in `App.tsx`

**Font inheritance**: NativeWind does NOT inherit `fontFamily` from parent views, unlike CSS. Solutions:
1. Use `AppText` wrapper component (`src/components/AppText.tsx`)
2. Or set `fontFamily` explicitly via `style` prop on each `<Text>`

**Tailwind config**: Single `fontFamily.sans` entry. **Do NOT create per-weight font families** (e.g., no `font-jakarta-bold`). Control weight via `font-bold`, `font-semibold`, etc.

### 3.2 Typography Scale

| Element | NativeWind Class | Usage |
|---|---|---|
| **Page title** | `text-2xl font-extrabold text-slate-900` | App name, main headings |
| **Section heading** | `text-xl font-extrabold text-slate-900` | Screen titles |
| **Card title** | `text-lg font-extrabold text-slate-900` | Card headings |
| **Body / item name** | `text-base font-semibold text-slate-900` | Input text |
| **Secondary text** | `text-sm font-semibold text-slate-700` | Phone number display |
| **Description** | `text-sm font-medium text-slate-500` | Subtitles, hints |
| **Muted** | `text-sm font-medium text-slate-400` | Placeholder-like text |
| **Button (primary)** | `text-base font-bold text-white` | CTA buttons |
| **Button (secondary)** | `text-sm font-bold text-slate-700` | Outline buttons |
| **Link text** | `text-sm font-semibold text-indigo-600` | Inline links |
| **Error text** | `text-sm font-semibold text-red-600` | Error messages |

### 3.3 Label Pattern (Uppercase Meta Labels)

```tsx
<Text className="mb-2 text-slate-500" style={labelStyle}>
  FIELD LABEL
</Text>
```

Where `labelStyle` from `tokens.ts`:
```ts
export const labelStyle: TextStyle = {
  fontSize: 12,
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: 1,
};
```

> **Rule**: NativeWind `tracking-wider` may not map correctly to `letterSpacing`. Always use `labelStyle` from `tokens.ts` for uppercase labels.

---

## 4. Spacing System

### 4.1 Page-Level Spacing

| Element | NativeWind Class |
|---|---|
| Container max-width | `maxWidth: 672` via `layoutContainer` in `tokens.ts` |
| Horizontal padding | `px-6` (24px) |
| Vertical padding | `py-8` (32px) |

### 4.2 Section / Component Spacing

| Element | NativeWind Class |
|---|---|
| Header to content | `mb-10` (40px) or `mb-8` (32px) |
| Form field spacing | `mb-5` (20px) to `mb-6` (24px) |
| Error banner margin | `mb-4` (16px) |
| Between cards | `mb-6` (24px) |
| Label to input | `mb-2` (8px) |

### 4.3 Component Internal Spacing

| Element | NativeWind Class |
|---|---|
| Card padding | `p-4` (16px) or `p-6` (24px) |
| Input field | `py-3.5 px-3` (14px / 12px) |
| CTA button | `py-4` (16px) full-width |
| Outline button | `py-3.5 px-6` |
| Icon + text gap | `gap-2` (8px) or `ml-2` / `mr-2` |
| OTP cell gap | `gap-3` (12px) |
| Validation row | `mb-2` (8px) |

---

## 5. Component Patterns

### 5.1 Card Design

```tsx
{/* §5.1 — Standard Card */}
<View
  className="rounded-2xl border border-slate-100 bg-white p-4"
  style={shadowCard}
>
  {/* content */}
</View>
```

Key properties:
- Border radius: `rounded-2xl` (16px)
- Border: `border border-slate-100`
- Background: `bg-white`
- Shadow: `shadowCard` from `tokens.ts`

### 5.2 Button Variants

#### Primary CTA (Dark Full-Width)

```tsx
<Pressable
  onPress={handleAction}
  disabled={isLoading}
  className="flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
  style={({ pressed }) => [
    shadowCTA,
    pressedStyle(pressed),
    { opacity: isLoading ? 0.5 : 1 },
  ]}
>
  <Text className="mr-2 text-base font-bold text-white">Button Text</Text>
  <ArrowRight size={20} color="#fff" weight="bold" />
</Pressable>
```

Key properties:
- `rounded-xl` (12px)
- `bg-slate-900` background
- `shadowCTA` from `tokens.ts`
- `pressedStyle(pressed)` for `scale(0.98)`
- `opacity: 0.5` for disabled

#### Outline Button

```tsx
<Pressable
  onPress={handleAction}
  className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5"
  style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}
>
  <SignOut size={20} color={Colors.slate700} weight="bold" />
  <Text className="text-sm font-bold text-slate-700">Button Text</Text>
</Pressable>
```

#### Icon Button (Back / Settings)

```tsx
<Pressable
  onPress={goBack}
  className="h-10 w-10 items-center justify-center rounded-xl bg-white"
  style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
>
  <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
</Pressable>
```

#### Link Button

```tsx
<Pressable
  onPress={handleLink}
  className="items-center py-2"
  style={({ pressed }) => pressedStyle(pressed)}
>
  <Text className="text-sm font-semibold text-indigo-600">Link Text</Text>
</Pressable>
```

### 5.3 Input Field Style

```tsx
{/* Label */}
<Text className="mb-2 text-slate-500" style={labelStyle}>
  FIELD LABEL
</Text>

{/* Input container with icon */}
<View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
  <Phone size={20} color={Colors.slate400} weight="bold" />
  <TextInput
    className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900"
    placeholder="Placeholder text"
    placeholderTextColor={Colors.slate300}
    value={value}
    onChangeText={setValue}
  />
</View>
```

Key properties:
- No shadow on inputs
- `rounded-xl` (12px)
- `border border-slate-200 bg-slate-50`
- `placeholderTextColor="#CBD5E1"` (slate-300)
- Icon color: `#94A3B8` (slate-400)

### 5.4 Border Radius Standard

| Context | NativeWind Class | Pixels |
|---|---|---|
| Small elements (pills, badges) | `rounded-full` | 9999px |
| Buttons, inputs | `rounded-xl` | 12px |
| Cards | `rounded-2xl` | 16px |
| Modal top corners | `rounded-t-3xl` | 24px |
| Icon circles | `rounded-full` | 9999px |
| Logo container | `rounded-full` | Circle |
| Error banner | `rounded-xl` | 12px |

> **Rule**: Minimum interactive element radius is `rounded-xl` (12px). No sharp corners anywhere.

### 5.5 Shadow System

NativeWind `shadow-*` utilities **do not work reliably on Android**. Always use React Native `style` prop with tokens from `src/theme/tokens.ts`:

| Token | Usage | `elevation` |
|---|---|---|
| `shadowCard` | Standard cards, validation boxes | 1 |
| `shadowFloating` | Back buttons, floating elements | 4 |
| `shadowOutline` | Outline/secondary buttons | 5 |
| `shadowCTA` | Primary CTA buttons | 8 |

```tsx
import { shadowCTA, shadowCard } from '@/theme/tokens';

// Apply via style prop:
<View style={shadowCard}>...</View>
<Pressable style={({ pressed }) => [shadowCTA, pressedStyle(pressed)]}>...</Pressable>
```

### 5.6 Error Banner

```tsx
{error && (
  <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
    <Text className="text-sm font-semibold text-red-600">{error}</Text>
  </View>
)}
```

### 5.7 Empty State / Feature Icon

```tsx
<View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
  <IconName size={32} color={Colors.indigo600} weight="bold" />
</View>
```

---

## 6. Interaction Patterns

### 6.1 Press Feedback (Replaces CSS hover/active)

React Native has **no hover, no CSS transitions, no `active:` pseudo-class**.

| Web (DON'T) | React Native (DO) |
|---|---|
| `hover:bg-slate-800` | Not applicable on mobile |
| `active:scale-[0.98]` in className | `style={({ pressed }) => pressedStyle(pressed)}` |
| `transition-all` | Not needed — Pressable handles state |
| `cursor-pointer` | Not applicable on mobile |

```tsx
// ✅ Correct: Pressable style function
<Pressable
  style={({ pressed }) => [
    shadowCTA,
    pressedStyle(pressed),           // scale(0.98)
    { opacity: disabled ? 0.5 : 1 },
  ]}
>
```

### 6.2 Disabled State

| Property | Value |
|---|---|
| Opacity | `0.5` (via `Pressable` style) |
| Interaction | `disabled={true}` prop |

> **Rule**: Always control opacity in the `style` function, not via NativeWind `opacity-50` class, so it coexists with `pressedStyle`.

### 6.3 Loading State

```tsx
{isLoading ? (
  <ActivityIndicator color="#fff" />
) : (
  <Text className="text-base font-bold text-white">Button Text</Text>
)}
```

---

## 7. Icon System

### Library

- **Package**: `phosphor-react-native`
- **Weight**: `bold` on ALL icons — never `regular`, `thin`, `light`, or `fill` (except validation checkmarks)
- **Import**: Named imports (`import { Phone, ArrowRight } from 'phosphor-react-native'`)

### Icon Sizing Scale

| Context | Size |
|---|---|
| Inline with input | `size={20}` |
| Button icon | `size={20}` |
| Feature / empty state icon | `size={32}` |
| Validation checkmark | `size={18}` |

### Icon Colors

| Context | Color |
|---|---|
| Input icon | `Colors.slate400` (`#94A3B8`) |
| Card icon | `Colors.slate600` (`#475569`) |
| Back button icon | `Colors.slate700` (`#334155`) |
| Feature icon | `Colors.indigo600` (`#4F46E5`) |
| Button icon (white) | `"#fff"` |
| Outline button icon | `Colors.slate700` |

### Commonly Used Icons

| Icon | Usage |
|---|---|
| `Phone` | Phone input |
| `ArrowRight` | Next/continue CTA |
| `ArrowLeft` | Back button |
| `Eye` / `EyeSlash` | Password toggle |
| `ShieldCheck` | OTP verification |
| `LockSimple` | Password screen |
| `CheckCircle` | Validation ✓ |
| `User` | Profile |
| `SignOut` | Logout |

---

## 8. Layout Rules

### 8.1 Layout Philosophy

- **Single centered column** on auth/onboarding screens
- **Full width** on mobile (no `max-w` constraint on phones)
- **Max 672px** on tablets/web via `layoutContainer` from `tokens.ts`
- Content vertically centered with `justify-center`

### 8.2 Page Structure (Auth screens)

```
┌──────────────────────────────────┐
│  SafeAreaView (flex-1 bg-page)   │
│  ┌────────────────────────────┐  │
│  │  KeyboardAvoidingView      │  │
│  │  ┌──────────────────────┐  │  │
│  │  │  ScrollView           │  │  │
│  │  │  ┌────────────────┐   │  │  │
│  │  │  │  Header (icon)  │   │  │  │
│  │  │  │  Form fields    │   │  │  │
│  │  │  │  CTA button     │   │  │  │
│  │  │  └────────────────┘   │  │  │
│  │  └──────────────────────┘  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### 8.3 ScrollView Setup

```tsx
<ScrollView
  contentContainerStyle={layoutContainer}
  contentContainerClassName="flex-grow justify-center px-6 py-8"
  keyboardShouldPersistTaps="handled"
>
```

Where `layoutContainer` = `{ width: '100%', maxWidth: 672, alignSelf: 'center' }`

### 8.4 Keyboard Avoiding

```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1"
>
```

---

## 9. Navigation

### Stack Navigators

- Auth screens: `createNativeStackNavigator` with `headerShown: false`
- `animation: 'slide_from_right'` for auth flow
- `contentStyle: { backgroundColor: Colors.page }`

### Screen routing (Auth)

```
AppNavigator
├── !isAuthenticated → AuthNavigator
│   ├── LoginScreen
│   ├── OtpScreen
│   └── SetPasswordScreen
├── isAuthenticated + !hasPassword → SetPasswordScreen
└── isAuthenticated + hasPassword → MainNavigator
    └── HomeScreen
```

---

## 10. NativeWind Migration Rules

### Tailwind Web → NativeWind Conversion

| Web | NativeWind | Notes |
|---|---|---|
| `hover:bg-*` | ❌ Remove | No hover on mobile |
| `group-hover:*` | ❌ Remove | No group hover |
| `transition-all` | ❌ Remove | RN doesn't support CSS transitions |
| `cursor-pointer` | ❌ Remove | Not applicable on mobile |
| `active:scale-*` | `Pressable` style function | NativeWind className unreliable |
| `shadow-*` | `style={shadowToken}` | NativeWind shadow broken on Android |
| `tracking-wider` | `style={labelStyle}` | `letterSpacing` via style prop |
| `<div>` | `<View>` | |
| `<button>` | `<Pressable>` | |
| `<input>` | `<TextInput>` | |
| `<img>` | `<Image>` | |
| `placeholder:text-*` | `placeholderTextColor` prop | |
| `focus:ring-*` | ❌ Not supported | RN inputs don't have focus rings |
| `linear-gradient(...)` | `<LinearGradient>` from `expo-linear-gradient` | |
| `backdrop-blur-*` | ❌ Limited support | Only for modals if needed |
| `max-w-2xl` | `style={{ maxWidth: 672 }}` | via `layoutContainer` |
| `sm:` responsive | Not native RN | Use `Dimensions` or Platform if needed |

### What NativeWind Handles Well

- All color utilities: `bg-*`, `text-*`, `border-*`
- Spacing: `p-*`, `m-*`, `gap-*`, `px-*`, `py-*`
- Flexbox: `flex-1`, `flex-row`, `items-center`, `justify-center`
- Typography sizing: `text-xs`, `text-sm`, `text-base`, `text-xl`
- Font weight: `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`
- Border radius: `rounded-xl`, `rounded-2xl`, `rounded-full`
- Border: `border`, `border-2`
- Width/height: `h-16`, `w-16`, `w-full`
- Opacity: `opacity-50`

### What NativeWind Does NOT Handle

| Feature | Solution |
|---|---|
| `shadow-*` on Android | `style` prop with `shadowColor/shadowOffset/elevation` |
| `letterSpacing` / `tracking-*` | `style` prop with `letterSpacing: 1` |
| `textTransform: uppercase` | Use `style` prop + `labelStyle` from tokens |
| Font family inheritance | `AppText` wrapper or explicit `fontFamily` style |
| Press feedback | `Pressable` `style` function |
| Gradients | `expo-linear-gradient` `<LinearGradient>` |

---

## 11. Token File Reference

All design values centralized in `src/theme/tokens.ts`:

```ts
import {
  // Colors
  Colors,
  // Shadows (ViewStyle objects)
  shadowCTA,        // CTA buttons
  shadowCard,       // Cards
  shadowFloating,   // Icon / back buttons
  shadowOutline,    // Outline buttons
  // Border Radii
  Radii,
  // Typography
  labelStyle,       // Uppercase label pattern
  // Layout
  layoutContainer,  // maxWidth: 672
  // Press feedback
  pressedStyle,     // scale(0.98)
  pressedStyleSmall,// scale(0.95)
  // Gradient
  gradient135,      // start/end for 135deg
} from '@/theme/tokens';
```

---

## 12. Tailwind Config

`tailwind.config.js`:

```js
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        // NO per-weight font families
      },
      colors: {
        page: '#F8F9FB',
        brand: {
          purple: '#E5DEFF', yellow: '#FFF4C3',
          orange: '#FFDCC2', cyan: '#C6F6F6', dark: '#0F172A',
        },
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0,0,0,0.05)',
        card: '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        glow: '0 0 20px rgba(99,102,241,0.5)',
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      letterSpacing: { wider: '0.05em', widest: '0.1em' },
    },
  },
};
```

---

## 13. Do and Don't Guidelines

### ✅ DO

| Rule | Example |
|---|---|
| Use **Plus Jakarta Sans** exclusively | Load via `@expo-google-fonts` |
| Use **pastel gradients** 135deg for brand | `expo-linear-gradient` with `gradient135` |
| Keep backgrounds **light** (`#F8F9FB` or white) | `bg-page` or `bg-white` |
| Use **rounded-xl** (12px) minimum for interactive elements | All buttons, inputs |
| Use **rounded-2xl** (16px) for cards | All card containers |
| Use **Phosphor Bold** icons exclusively | `weight="bold"` on all icons |
| Use **uppercase `labelStyle`** for form labels | Import from `tokens.ts` |
| Apply **`shadowCTA`** to all CTA buttons | Import from `tokens.ts` |
| Apply **`shadowCard`** to all cards | Import from `tokens.ts` |
| Use **`pressedStyle(pressed)`** on all Pressable | Physical press feedback |
| Use **`layoutContainer`** on ScrollView content | Max 672px width |
| Use **`Colors.*`** constants for inline colors | Never hardcode hex in JSX props |
| Use **`Pressable`** for all touchables | Not `TouchableOpacity` |
| Use **`placeholderTextColor`** prop on TextInput | Not NativeWind `placeholder:` |
| Use **`SafeAreaView`** from `react-native-safe-area-context` | Not the RN built-in one |

### ❌ DON'T

| Rule | Reason |
|---|---|
| Don't use `hover:`, `group-hover:`, `transition-*` | Not applicable on RN mobile |
| Don't use `active:scale-*` in NativeWind className | Unreliable — use Pressable style |
| Don't use `shadow-*` NativeWind classes | Broken on Android — use style tokens |
| Don't use `<div>`, `<button>`, `<input>`, `<img>` | Use RN components |
| Don't use more than 1 font family | Plus Jakarta Sans only |
| Don't create `font-jakarta-*` per-weight families | Use `font-bold`, `font-semibold` etc. |
| Don't use saturated/neon colors | Palette is pastel/slate only |
| Don't use sharp corners (< 12px radius) | Everything is rounded |
| Don't use dark backgrounds | Light-theme only |
| Don't use `TouchableOpacity` / `TouchableHighlight` | Use `Pressable` with style function |
| Don't hardcode hex values in JSX props | Use `Colors.*` from tokens |
| Don't copy-paste shadow objects | Import from `tokens.ts` |
| Don't use `opacity-50` className for disabled | Use `style={{ opacity: 0.5 }}` in Pressable |

---

## 14. Dependencies

| Package | Purpose |
|---|---|
| `expo` (SDK 55) | Runtime environment |
| `react-native` | UI framework |
| `nativewind` | Tailwind CSS for React Native |
| `expo-linear-gradient` | Gradient components |
| `expo-font` | Custom font loading |
| `@expo-google-fonts/plus-jakarta-sans` | Typography |
| `phosphor-react-native` | Icon library (Bold weight) |
| `react-native-safe-area-context` | Safe area handling |
| `@react-navigation/native` | Navigation |
| `@react-navigation/native-stack` | Stack navigator |
| `@reduxjs/toolkit` + `react-redux` | State management |
| `axios` | HTTP client |
| `firebase` (JS SDK) | Phone OTP authentication |
| `expo-firebase-recaptcha` | Recaptcha for Firebase |
| `@react-native-async-storage/async-storage` | Firebase persistence |
| `expo-secure-store` | Secure token storage |

---

## 15. Pre-Delivery Checklist

Before delivering any screen or component:

### Visual Quality
- [ ] `bg-page` as root background
- [ ] All cards use `rounded-2xl` + `shadowCard`
- [ ] All CTA buttons use `rounded-xl` + `shadowCTA`
- [ ] All inputs use `rounded-xl` + `border-slate-200` + `bg-slate-50`
- [ ] Labels use `labelStyle` (uppercase, letterSpacing)
- [ ] Icons are Phosphor Bold only
- [ ] Colors from `Colors.*` constants, not hardcoded

### Interaction
- [ ] All Pressable use `pressedStyle()` or `pressedStyleSmall()`
- [ ] Disabled state = `opacity: 0.5` in style
- [ ] Loading state = `<ActivityIndicator color="#fff" />`
- [ ] No hover/transition classes in className

### Layout
- [ ] `SafeAreaView` wraps all screens
- [ ] `KeyboardAvoidingView` on screens with inputs
- [ ] `ScrollView` with `layoutContainer` and `keyboardShouldPersistTaps="handled"`
- [ ] Content vertically centered on auth screens

### Typography
- [ ] Plus Jakarta Sans loads via App.tsx
- [ ] No per-weight font-family references
- [ ] Text hierarchy matches §3.2 scale

---

*This specification fully documents the LaundryPro design system for Expo + React Native + NativeWind. Any AI or developer should be able to replicate the exact same visual style using this document as the sole reference.*
