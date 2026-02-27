// src/features/auth/screens/OtpScreen.tsx
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
import { ArrowLeft, ShieldCheck } from 'phosphor-react-native';
import { ConfirmationResult } from 'firebase/auth';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { loginWithOtpThunk, getProfileThunk, clearError } from '../authSlice';
import {
  Colors,
  shadowCTA,
  shadowFloating,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
} from '@/theme/tokens';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type AuthStackParamList = {
  Login: undefined;
  Otp: { phone: string; confirmation: ConfirmationResult };
  SetPassword: undefined;
};

type OtpScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Otp'>;
  route: RouteProp<AuthStackParamList, 'Otp'>;
};

const OTP_LENGTH = 6;

export default function OtpScreen({ navigation, route }: OtpScreenProps) {
  const { phone, confirmation } = route.params;
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      if (!confirmation || code.length !== OTP_LENGTH) return;
      dispatch(clearError());

      try {
        const result = await confirmation.confirm(code);
        const idToken = await result.user.getIdToken();

        const loginResult = await dispatch(loginWithOtpThunk(idToken));

        if (loginWithOtpThunk.fulfilled.match(loginResult)) {
          await dispatch(getProfileThunk());
        }
      } catch (err: any) {
        console.error('Verify OTP error:', err.message);
      }
    },
    [confirmation, dispatch],
  );

  return (
    <SafeAreaView className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* ── §5.2 Icon button (Back) ── */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white"
            style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
          >
            <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="flex-grow justify-center px-6 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* ── §10 Empty state icon pattern ── */}
          <View className="mb-6 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <ShieldCheck size={32} color={Colors.indigo600} weight="bold" />
            </View>
            <Text className="text-xl font-extrabold text-slate-900">
              Xác thực OTP
            </Text>
            <Text className="mt-2 text-center text-sm font-medium text-slate-500">
              Mã xác thực đã được gửi đến{'\n'}
              <Text className="font-bold text-slate-900">{phone}</Text>
            </Text>
          </View>

          {/* ── Error ── */}
          {error && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>
          )}

          {/* ── §5.3 OTP Input cells ── */}
          <View className="mb-8 flex-row justify-center gap-3">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={{
                  height: 56,
                  width: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: digit ? Colors.indigo500 : Colors.slate200,
                  backgroundColor: digit ? Colors.indigo50 : Colors.slate50,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: '700',
                  color: Colors.slate900,
                }}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* ── §5.2 Full-Width Submit (Dark) ── */}
          <Pressable
            onPress={() => handleVerifyOtp(otp.join(''))}
            disabled={isLoading || otp.some((d) => !d)}
            className="flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
            style={({ pressed }) => [
              shadowCTA,
              pressedStyle(pressed),
              { opacity: isLoading || otp.some((d) => !d) ? 0.5 : 1 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Xác nhận</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
