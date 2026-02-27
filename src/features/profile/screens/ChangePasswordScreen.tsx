// src/features/profile/screens/ChangePasswordScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, LockKey, FloppyDisk } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { changePasswordThunk, clearProfileError } from '../profileSlice';
import {
  Colors,
  shadowCTA,
  shadowFloating,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
  labelStyle,
} from '@/theme/tokens';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MainStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ChangePassword'>;
};

export default function ChangePasswordScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.profile);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length >= 8;

  const handleSave = useCallback(async () => {
    setLocalError(null);
    dispatch(clearProfileError());

    if (newPassword !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!isValid) return;

    const payload = {
      currentPassword,
      newPassword,
      confirmPassword, // Swagger expects this format
    };

    const result = await dispatch(changePasswordThunk(payload));
    if (changePasswordThunk.fulfilled.match(result)) {
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [isValid, currentPassword, newPassword, confirmPassword, dispatch, navigation]);

  const displayError = localError || error;

  return (
    <SafeAreaView className="flex-1 bg-page">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white"
          style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
        >
          <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
        </Pressable>
        <Text className="flex-1 text-lg font-extrabold text-slate-900">
          Đổi mật khẩu
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="px-6 pb-8 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          {displayError && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{displayError}</Text>
            </View>
          )}

          <View className="mb-6">
            <Text className="mb-2 text-slate-400" style={labelStyle}>
              MẬT KHẨU HIỆN TẠI *
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <LockKey size={18} color={Colors.slate400} weight="bold" />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor={Colors.slate400}
                secureTextEntry
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setLocalError(null);
                  dispatch(clearProfileError());
                }}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-slate-400" style={labelStyle}>
              MẬT KHẨU MỚI *
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <LockKey size={18} color={Colors.slate400} weight="bold" />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                placeholder="Tối thiểu 8 ký tự"
                placeholderTextColor={Colors.slate400}
                secureTextEntry
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setLocalError(null);
                  dispatch(clearProfileError());
                }}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-slate-400" style={labelStyle}>
              XÁC NHẬN MẬT KHẨU MỚI *
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <LockKey size={18} color={Colors.slate400} weight="bold" />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor={Colors.slate400}
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setLocalError(null);
                  dispatch(clearProfileError());
                }}
              />
            </View>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSave}
            disabled={isLoading || !isValid}
            className="mt-4 flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
            style={({ pressed }) => [
              shadowCTA,
              pressedStyle(pressed),
              { opacity: isLoading || !isValid ? 0.5 : 1 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FloppyDisk size={20} color="#fff" weight="bold" />
                <Text className="ml-2 text-base font-bold text-white">
                  Cập nhật mật khẩu
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
