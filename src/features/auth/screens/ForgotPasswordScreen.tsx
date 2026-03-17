import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Phone } from 'phosphor-react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { clearError } from '../authSlice';
import {
  Colors,
  layoutContainer,
  labelStyle,
  pressedStyle,
  pressedStyleSmall,
  shadowCTA,
  shadowFloating,
} from '@/theme/tokens';

type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: { phone?: string } | undefined;
  ForgotPasswordOtp: {
    phone: string;
    confirmation: FirebaseAuthTypes.ConfirmationResult;
  };
};

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
  route: RouteProp<AuthStackParamList, 'ForgotPassword'>;
};

function normalizeVNPhone(raw: string): string {
  const p = raw.trim().replace(/[\s-]/g, '');
  if (p.startsWith('+84')) return p;
  if (p.startsWith('0')) return `+84${p.slice(1)}`;
  return '';
}

export default function ForgotPasswordScreen({
  navigation,
  route,
}: ForgotPasswordScreenProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [phone, setPhone] = useState(route.params?.phone?.replace(/[^0-9]/g, '') ?? '');
  const [localLoading, setLocalLoading] = useState(false);

  const isAnyLoading = isLoading || localLoading;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSendOtp = useCallback(async () => {
    const phoneE164 = normalizeVNPhone(phone);
    if (!phoneE164) return;

    dispatch(clearError());
    setLocalLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneE164);
      navigation.navigate('ForgotPasswordOtp', { phone: phoneE164, confirmation });
    } catch (err: any) {
      console.error('Forgot password send OTP error:', err.message);
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, navigation, phone]);

  return (
    <SafeAreaView className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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
          <View className="mb-10">
            <Text className="text-2xl font-extrabold text-slate-900">
              Quên mật khẩu
            </Text>
            <Text className="mt-3 text-sm font-medium leading-6 text-slate-500">
              Nhập số điện thoại đã đăng ký để nhận mã OTP và đặt lại mật khẩu.
            </Text>
          </View>

          {error && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>
          )}

          <Text className="mb-2 text-slate-500" style={labelStyle}>
            SỐ ĐIỆN THOẠI
          </Text>
          <View className="mb-6 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Phone size={20} color={Colors.slate400} weight="bold" />
            <TextInput
              className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900"
              placeholder="0788 876 568"
              placeholderTextColor={Colors.slate300}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              autoFocus
            />
          </View>

          <Pressable
            onPress={handleSendOtp}
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
                  Gửi mã OTP
                </Text>
                <ArrowRight size={20} color="#fff" weight="bold" />
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Login')}
            className="mt-4 items-center py-2"
            style={({ pressed }) => pressedStyle(pressed)}
          >
            <Text className="text-sm font-semibold text-indigo-600">
              Quay lại đăng nhập
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
