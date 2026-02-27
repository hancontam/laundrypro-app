// src/features/profile/screens/EditProfileScreen.tsx
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
import { ArrowLeft, User, Envelope, MapPin, FloppyDisk } from 'phosphor-react-native';
// You could also add expo-image-picker here if you want avatar uploads
import { useAppDispatch, useAppSelector } from '@/app/store';
import { updateProfileThunk, clearProfileError } from '../profileSlice';
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
  EditProfile: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'EditProfile'>;
};

export default function EditProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading, error } = useAppSelector((state) => state.profile);

  // Form Initial State derived from Auth User
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  // For avatar, we would integrate expo-image-picker, but for simplicity we omit it here unless requested
  // const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const isValid = name.trim().length > 0;

  const handleSave = useCallback(async () => {
    if (!isValid) return;
    dispatch(clearProfileError());

    const payload = {
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
      // avatar processing would go here
    };

    const result = await dispatch(updateProfileThunk(payload));
    if (updateProfileThunk.fulfilled.match(result)) {
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [isValid, name, email, address, dispatch, navigation]);

  if (!user) return null;

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
          Chỉnh sửa thông tin
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

          <View className="mb-6">
            <Text className="mb-2 text-slate-400" style={labelStyle}>
              HỌ VÀ TÊN *
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <User size={18} color={Colors.slate400} weight="bold" />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                placeholder="Nhập họ tên"
                placeholderTextColor={Colors.slate400}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-slate-400" style={labelStyle}>
              EMAIL
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <Envelope size={18} color={Colors.slate400} weight="bold" />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                placeholder="Nhập email"
                placeholderTextColor={Colors.slate400}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-slate-400" style={labelStyle}>
              ĐỊA CHỈ
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <MapPin size={18} color={Colors.slate400} weight="bold" />
              <TextInput
                className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                placeholder="Nhập địa chỉ của bạn"
                placeholderTextColor={Colors.slate400}
                value={address}
                onChangeText={setAddress}
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
                  Lưu thay đổi
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
