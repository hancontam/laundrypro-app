// src/features/auth/screens/SetPasswordScreen.tsx
import React, { useState, useCallback } from 'react';
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
import { LockSimple, Eye, EyeSlash, CheckCircle } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { setPasswordThunk, getProfileThunk, clearError } from '../authSlice';
import {
  Colors,
  shadowCTA,
  shadowCard,
  pressedStyle,
  layoutContainer,
  labelStyle,
} from '@/theme/tokens';

export default function SetPasswordScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Validation ──
  const minLength = password.length >= 6;
  const hasMatch = password === confirmPassword && confirmPassword.length > 0;
  const isValid = minLength && hasMatch;

  const handleSetPassword = useCallback(async () => {
    if (!isValid) return;
    dispatch(clearError());

    const result = await dispatch(
      setPasswordThunk({ password, confirmPassword }),
    );

    if (setPasswordThunk.fulfilled.match(result)) {
      // Reload profile to update user.hasPassword → AppNavigator redirects
      await dispatch(getProfileThunk());
    }
  }, [password, confirmPassword, isValid, dispatch]);

  return (
    <SafeAreaView className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="flex-grow justify-center px-6 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* ── §10 Header with icon ── */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <LockSimple size={32} color={Colors.indigo600} weight="bold" />
            </View>
            <Text className="text-xl font-extrabold text-slate-900">
              Tạo mật khẩu
            </Text>
            <Text className="mt-2 text-center text-sm font-medium text-slate-500">
              Thiết lập mật khẩu để đăng nhập nhanh hơn{'\n'}trong lần sau
            </Text>
          </View>

          {/* ── Error ── */}
          {error && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>
          )}

          {/* ── Password §5.3 ── */}
          <View className="mb-5">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              MẬT KHẨU
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <LockSimple size={20} color={Colors.slate400} weight="bold" />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900"
                placeholder="Tối thiểu 6 ký tự"
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
          </View>

          {/* ── Confirm Password §5.3 ── */}
          <View className="mb-6">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              XÁC NHẬN MẬT KHẨU
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <LockSimple size={20} color={Colors.slate400} weight="bold" />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900"
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={Colors.slate300}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirm(!showConfirm)}
                className="p-1"
              >
                {showConfirm ? (
                  <EyeSlash size={20} color={Colors.slate400} weight="bold" />
                ) : (
                  <Eye size={20} color={Colors.slate400} weight="bold" />
                )}
              </Pressable>
            </View>
          </View>

          {/* ── §5.1 Validation card with shadow-sm ── */}
          <View
            className="mb-8 rounded-2xl border border-slate-100 bg-white p-4"
            style={shadowCard}
          >
            <ValidationRow label="Tối thiểu 6 ký tự" isValid={minLength} />
            <ValidationRow label="Mật khẩu khớp nhau" isValid={hasMatch} />
          </View>

          {/* ── §5.2 Full-Width Submit ── */}
          <Pressable
            onPress={handleSetPassword}
            disabled={isLoading || !isValid}
            className="flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
            style={({ pressed }) => [
              shadowCTA,
              pressedStyle(pressed),
              { opacity: isLoading || !isValid ? 0.5 : 1 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">
                Xác nhận mật khẩu
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── §Validation row ────────────────────────────────────────────
function ValidationRow({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <View className="mb-2 flex-row items-center">
      <CheckCircle
        size={18}
        color={isValid ? Colors.green500 : Colors.slate300}
        weight={isValid ? 'fill' : 'bold'}
      />
      <Text
        className={`ml-2 text-sm font-medium ${
          isValid ? 'text-green-600' : 'text-slate-400'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
