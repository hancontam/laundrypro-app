// src/features/users/screens/CreateStaffScreen.tsx
// Admin only — Create new staff member
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
import { ArrowLeft, UserPlus } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { createStaffThunk, clearUserError } from '../usersSlice';
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
  StaffList: undefined;
  StaffDetail: { userId: string };
  CreateStaff: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'CreateStaff'>;
};

export default function CreateStaffScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.users);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const isValid = phone.trim().length >= 10 && name.trim().length >= 2;

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    dispatch(clearUserError());

    const payload: any = {
      phone: phone.trim().startsWith('+') ? phone.trim() : `+84${phone.trim().replace(/^0/, '')}`,
      name: name.trim(),
    };
    if (email.trim()) payload.email = email.trim();

    const result = await dispatch(createStaffThunk(payload));
    if (createStaffThunk.fulfilled.match(result)) {
      Alert.alert('Thành công', 'Đã tạo nhân viên. Nhân viên cần đăng nhập OTP lần đầu.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [phone, name, email, isValid, dispatch, navigation]);

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
          Thêm nhân viên
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="px-6 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Info banner */}
          <View className="mb-6 rounded-xl bg-indigo-50 px-4 py-3">
            <Text className="text-sm font-semibold text-indigo-700">
              Nhân viên mới sẽ cần đăng nhập bằng OTP lần đầu để xác thực, sau đó
              đặt mật khẩu.
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>
          )}

          {/* Phone */}
          <View className="mb-5">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              SỐ ĐIỆN THOẠI *
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
              <TextInput
                className="py-3.5 text-base font-semibold text-slate-900"
                placeholder="0901234567"
                placeholderTextColor={Colors.slate300}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                autoFocus
              />
            </View>
          </View>

          {/* Name */}
          <View className="mb-5">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              HỌ VÀ TÊN *
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
              <TextInput
                className="py-3.5 text-base font-semibold text-slate-900"
                placeholder="Nguyễn Văn A"
                placeholderTextColor={Colors.slate300}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email (optional) */}
          <View className="mb-8">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              EMAIL (TÙY CHỌN)
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
              <TextInput
                className="py-3.5 text-base font-semibold text-slate-900"
                placeholder="staff@laundrypro.com"
                placeholderTextColor={Colors.slate300}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
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
              <>
                <UserPlus size={20} color="#fff" weight="bold" />
                <Text className="ml-2 text-base font-bold text-white">
                  Tạo nhân viên
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
