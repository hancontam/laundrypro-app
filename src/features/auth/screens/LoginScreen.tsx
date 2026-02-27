// src/features/auth/screens/LoginScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, ArrowRight, Eye, EyeSlash } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/services/firebase';
import firebaseConfig from '@/services/firebase';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  checkLoginThunk,
  loginWithPasswordThunk,
  getProfileThunk,
  clearError,
} from '../authSlice';
import {
  Colors,
  shadowCTA,
  shadowCard,
  gradient135,
  pressedStyle,
  layoutContainer,
  labelStyle,
} from '@/theme/tokens';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Login: undefined;
  Otp: { phone: string; confirmation: ConfirmationResult };
  SetPassword: undefined;
};

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

/** 0788876568 → +84788876568 */
function normalizeVNPhone(raw: string): string {
  const p = raw.trim().replace(/[\s-]/g, '');
  if (p.startsWith('+84')) return p;
  if (p.startsWith('0')) return `+84${p.slice(1)}`;
  return '';
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal | null>(null);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'phone' | 'password'>('phone');
  const [localLoading, setLocalLoading] = useState(false);

  const isAnyLoading = isLoading || localLoading;

  // ── Send Firebase OTP ──
  const sendOtp = useCallback(
    async (phoneE164: string) => {
      if (!recaptchaRef.current) return;
      setLocalLoading(true);
      try {
        const confirmation = await signInWithPhoneNumber(
          auth,
          phoneE164,
          recaptchaRef.current as any,
        );
        navigation.navigate('Otp', { phone: phoneE164, confirmation });
      } catch (err: any) {
        console.error('Send OTP error:', err.message);
      } finally {
        setLocalLoading(false);
      }
    },
    [navigation],
  );

  // ── Step 1: Check login method ──
  const handleCheckLogin = useCallback(async () => {
    const phoneE164 = normalizeVNPhone(phone);
    if (!phoneE164) return;
    dispatch(clearError());

    const result = await dispatch(checkLoginThunk(phoneE164));

    if (checkLoginThunk.fulfilled.match(result)) {
      const { loginMethod } = result.payload;
      if (loginMethod === 'otp') {
        await sendOtp(phoneE164);
      } else {
        setStep('password');
      }
    }
  }, [phone, dispatch, sendOtp]);

  // ── Password login → load profile ──
  const handlePasswordLogin = useCallback(async () => {
    if (!password.trim()) return;
    const phoneE164 = normalizeVNPhone(phone);
    dispatch(clearError());

    const result = await dispatch(
      loginWithPasswordThunk({ phone: phoneE164, password }),
    );

    if (loginWithPasswordThunk.fulfilled.match(result)) {
      await dispatch(getProfileThunk());
    }
  }, [phone, password, dispatch]);

  const handleGoBackToPhone = () => {
    setStep('phone');
    setPassword('');
    dispatch(clearError());
  };

  return (
    <SafeAreaView className="flex-1 bg-page">
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseConfig}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View className="mb-10 items-center">
            <View className="mb-6">
              {/* §2.4 — 135deg diagonal gradient */}
              <LinearGradient
                colors={[Colors.indigo50, Colors.indigo200]}
                start={gradient135.start}
                end={gradient135.end}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-2xl font-extrabold text-indigo-600">LP</Text>
              </LinearGradient>
            </View>

            <Text className="text-2xl font-extrabold text-slate-900">
              LaundryPro
            </Text>
            <Text className="mt-2 text-sm font-medium text-slate-500">
              {step === 'phone'
                ? 'Nhập số điện thoại để đăng nhập'
                : 'Nhập mật khẩu của bạn'}
            </Text>
          </View>

          {/* ── Error §2.3 ── */}
          {error && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>
          )}

          {/* ── Phone Step ── */}
          {step === 'phone' && (
            <View>
              {/* §3.3 — Uppercase label */}
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                SỐ ĐIỆN THOẠI
              </Text>

              {/* §5.3 — Input field */}
              <View className="mb-6 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <Phone size={20} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900"
                  placeholder="0788 876 568"
                  placeholderTextColor={Colors.slate300}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  autoFocus
                />
              </View>

              {/* §5.2 — Full-Width Submit (Dark) */}
              <Pressable
                onPress={handleCheckLogin}
                disabled={isAnyLoading || !phone.trim()}
                className="flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
                style={({ pressed }) => [
                  shadowCTA,
                  pressedStyle(pressed),
                  { opacity: isAnyLoading || !phone.trim() ? 0.5 : 1 },
                ]}
              >
                {isAnyLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="mr-2 text-base font-bold text-white">
                      Tiếp tục
                    </Text>
                    <ArrowRight size={20} color="#fff" weight="bold" />
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* ── Password Step ── */}
          {step === 'password' && (
            <View>
              {/* §5.1 — Card with shadow-sm */}
              <View
                className="mb-4 flex-row items-center rounded-2xl border border-slate-100 bg-white px-4 py-3"
                style={shadowCard}
              >
                <Phone size={18} color={Colors.slate600} weight="bold" />
                <Text className="ml-2 flex-1 text-sm font-semibold text-slate-700">
                  {normalizeVNPhone(phone)}
                </Text>
                <Pressable
                  onPress={handleGoBackToPhone}
                  style={({ pressed }) => pressedStyle(pressed)}
                >
                  <Text className="text-sm font-bold text-indigo-600">Thay đổi</Text>
                </Pressable>
              </View>

              {/* §3.3 — Uppercase label */}
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                MẬT KHẨU
              </Text>

              {/* §5.3 — Input field */}
              <View className="mb-6 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <TextInput
                  className="flex-1 py-3.5 text-base font-semibold text-slate-900"
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={Colors.slate300}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-1"
                >
                  {showPassword ? (
                    <EyeSlash size={20} color={Colors.slate400} weight="bold" />
                  ) : (
                    <Eye size={20} color={Colors.slate400} weight="bold" />
                  )}
                </Pressable>
              </View>

              {/* §5.2 — Full-Width Submit (Dark) */}
              <Pressable
                onPress={handlePasswordLogin}
                disabled={isAnyLoading || !password.trim()}
                className="flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
                style={({ pressed }) => [
                  shadowCTA,
                  pressedStyle(pressed),
                  { opacity: isAnyLoading || !password.trim() ? 0.5 : 1 },
                ]}
              >
                {isAnyLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="mr-2 text-base font-bold text-white">
                      Đăng nhập
                    </Text>
                    <ArrowRight size={20} color="#fff" weight="bold" />
                  </>
                )}
              </Pressable>

              {/* OTP link */}
              <Pressable
                onPress={() => sendOtp(normalizeVNPhone(phone))}
                className="mt-4 items-center py-2"
                style={({ pressed }) => pressedStyle(pressed)}
              >
                <Text className="text-sm font-semibold text-indigo-600">
                  Đăng nhập bằng OTP
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
