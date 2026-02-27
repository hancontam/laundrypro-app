// src/features/users/screens/EditStaffScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
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
import { ArrowLeft, User, Phone, Envelope, FloppyDisk } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { updateStaffThunk, clearUserError } from '../usersSlice';
import { Colors, shadowFloating, shadowCTA, pressedStyle, pressedStyleSmall, labelStyle, layoutContainer } from '@/theme/tokens';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type MainStackParamList = {
  EditStaff: { staffId: string };
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'EditStaff'>;
  route: RouteProp<MainStackParamList, 'EditStaff'>;
};

export default function EditStaffScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { staffId } = route.params;

  const { isLoading, error, selectedUser } = useAppSelector((state) => state.users);

  // We only allow editing name, email
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Hydrate fields
  useEffect(() => {
    if (selectedUser && selectedUser._id === staffId) {
      setName(selectedUser.name || '');
      setEmail(selectedUser.email || '');
    }
  }, [selectedUser, staffId]);

  const isValid = name.trim().length >= 1;

  const handleSave = useCallback(async () => {
    if (!isValid) return;
    dispatch(clearUserError());

    const result = await dispatch(
      updateStaffThunk({
        id: staffId,
        payload: {
          name: name.trim(),
          email: email.trim(),
        },
      })
    );

    if (updateStaffThunk.fulfilled.match(result)) {
      Alert.alert('Thành công', 'Cập nhật nhân viên thành công', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [isValid, dispatch, staffId, name, email, navigation]);

  return (
    <SafeAreaView className="flex-1 bg-page">
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white"
          style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
        >
          <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
        </Pressable>
        <Text className="flex-1 text-lg font-extrabold text-slate-900">
          Sửa nhân viên
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
          {error && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>
          )}

          <View>
            {/* Phone (Read Only) */}
            <View className="mb-6">
              <Text className="mb-2 text-slate-400" style={labelStyle}>
                SỐ ĐIỆN THOẠI
              </Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-100 px-3">
                <Phone size={18} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-500"
                  value={selectedUser?.phone || ''}
                  editable={false}
                />
              </View>
              <Text className="mt-1 text-xs text-slate-400">Không thể sửa đổi số điện thoại</Text>
            </View>

            {/* Name */}
            <View className="mb-6">
              <Text className="mb-2 text-slate-400" style={labelStyle}>
                HỌ VÀ TÊN *
              </Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <User size={18} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                  placeholder="Tên nhân viên"
                  placeholderTextColor={Colors.slate400}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-6">
              <Text className="mb-2 text-slate-400" style={labelStyle}>
                EMAIL
              </Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <Envelope size={18} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.slate400}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSave}
            disabled={isLoading || !isValid}
            className="mt-2 flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
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
                <Text className="ml-2 text-base font-bold text-white">Lưu thay đổi</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
