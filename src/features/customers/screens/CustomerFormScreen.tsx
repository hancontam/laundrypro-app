// src/features/customers/screens/CustomerFormScreen.tsx
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
import { ArrowLeft, User, Phone, Envelope, MapPin, CircleDashed, FloppyDisk } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  createCustomerThunk,
  updateCustomerThunk,
  clearCustomersError,
  selectCustomerById,
} from '../customersSlice';
import { Colors, shadowFloating, shadowCTA, pressedStyle, pressedStyleSmall, labelStyle, layoutContainer } from '@/theme/tokens';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type MainStackParamList = {
  CustomerList: undefined;
  CustomerForm: { customerId?: string } | undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'CustomerForm'>;
  route: RouteProp<MainStackParamList, 'CustomerForm'>;
};

export default function CustomerFormScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const customerId = route.params?.customerId;
  const isEditing = !!customerId;

  const { isLoading, error } = useAppSelector((state) => state.customers);
  const existingCustomer = useAppSelector((state) =>
    customerId ? selectCustomerById(state, customerId) : null
  );

  const [phone, setPhone] = useState(existingCustomer?.phone || '');
  const [name, setName] = useState(existingCustomer?.name || '');
  const [email, setEmail] = useState(existingCustomer?.email || '');
  const [address, setAddress] = useState(existingCustomer?.address || '');
  const [note, setNote] = useState(existingCustomer?.note || '');

  // Effect to populate form when editing and existingCustomer loads later
  useEffect(() => {
    if (isEditing && existingCustomer) {
      setPhone(existingCustomer.phone);
      setName(existingCustomer.name || '');
      setEmail(existingCustomer.email || '');
      setAddress(existingCustomer.address || '');
      setNote(existingCustomer.note || '');
    }
  }, [isEditing, existingCustomer]);

  // Validations: Phone strictly needed for creation, Name is commonly required
  const isValid =
    (isEditing || phone.trim().length >= 10) && name.trim().length >= 1;

  const handleSave = useCallback(async () => {
    if (!isValid) return;
    dispatch(clearCustomersError());

    // Auto format phone to E.164 if missing
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+84${formattedPhone.replace(/^0/, '')}`;
    }

    if (isEditing && customerId) {
      const result = await dispatch(
        updateCustomerThunk({
          id: customerId,
          name: name.trim(),
          email: email.trim(),
          address: address.trim(),
          note: note.trim(),
        })
      );
      if (updateCustomerThunk.fulfilled.match(result)) {
        Alert.alert('Thành công', 'Cập nhật khách hàng thành công', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } else {
      const result = await dispatch(
        createCustomerThunk({
          phone: formattedPhone,
          name: name.trim(),
          email: email.trim(),
          address: address.trim(),
          note: note.trim(),
        })
      );
      if (createCustomerThunk.fulfilled.match(result)) {
        Alert.alert('Thành công', 'Thêm khách hàng thành công', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    }
  }, [isValid, isEditing, customerId, phone, name, email, address, note, dispatch, navigation]);

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
          {isEditing ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng'}
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

          {/* Form container */}
          <View>
            {/* Phone - only editable initially or if swagger supports PUT phone, but our type doesn't support phone update */}
            <View className="mb-6">
              <Text className="mb-2 text-slate-400" style={labelStyle}>
                SỐ ĐIỆN THOẠI *
              </Text>
              <View
                className={`flex-row items-center rounded-xl border border-slate-200 px-3 ${
                  isEditing ? 'bg-slate-100' : 'bg-slate-50'
                }`}
              >
                <Phone size={18} color={Colors.slate400} weight="bold" />
                <TextInput
                  className={`ml-3 flex-1 py-3.5 text-base font-medium ${
                    isEditing ? 'text-slate-500' : 'text-slate-900'
                  }`}
                  placeholder="0901234567"
                  placeholderTextColor={Colors.slate400}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!isEditing}
                />
              </View>
              {isEditing && (
                <Text className="mt-1 text-xs text-slate-400">Không thể sửa đổi số điện thoại</Text>
              )}
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
                  placeholder="Tên khách hàng"
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

            {/* Address */}
            <View className="mb-6">
              <Text className="mb-2 text-slate-400" style={labelStyle}>
                ĐỊA CHỈ
              </Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <MapPin size={18} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3.5 text-base font-medium text-slate-900"
                  placeholder="Địa chỉ khách hàng"
                  placeholderTextColor={Colors.slate400}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* Note */}
            <View className="mb-6">
              <Text className="mb-2 text-slate-400" style={labelStyle}>
                GHI CHÚ
              </Text>
              <View className="items-start rounded-xl border border-slate-200 bg-slate-50 px-3">
                <View className="mt-3 absolute left-3">
                  <CircleDashed size={18} color={Colors.slate400} weight="bold" />
                </View>
                <TextInput
                  className="ml-8 flex-1 py-3.5 pr-2 text-base font-medium text-slate-900 min-h-[80px]"
                  placeholder="Ghi chú thêm (không bắt buộc)"
                  placeholderTextColor={Colors.slate400}
                  multiline
                  textAlignVertical="top"
                  value={note}
                  onChangeText={setNote}
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
                <Text className="ml-2 text-base font-bold text-white">Lưu thông tin</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
