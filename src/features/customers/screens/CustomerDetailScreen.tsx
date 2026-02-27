// src/features/customers/screens/CustomerDetailScreen.tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  User,
  Phone,
  Envelope,
  MapPin,
  PencilSimple,
  CircleDashed,
  PlayCircle,
  StopCircle,
} from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  fetchCustomerByIdThunk,
  updateCustomerStatusThunk,
  clearSelectedCustomer,
  selectCustomerById,
} from '../customersSlice';
import { Colors, shadowCard, shadowCTA, shadowFloating, pressedStyleSmall, labelStyle, layoutContainer } from '@/theme/tokens';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type MainStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
  CustomerForm: { customerId?: string } | undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'CustomerDetail'>;
  route: RouteProp<MainStackParamList, 'CustomerDetail'>;
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View className="mb-4 flex-row items-start gap-3">
      <View className="mt-0.5">
        <Icon size={18} color={Colors.slate400} weight="bold" />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-semibold text-slate-400">{label}</Text>
        <Text className="mt-0.5 text-base font-medium text-slate-900">{value}</Text>
      </View>
    </View>
  );
}

export default function CustomerDetailScreen({ navigation, route }: Props) {
  const { customerId } = route.params;
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.customers);
  const customer = useAppSelector((state) => selectCustomerById(state, customerId));

  useEffect(() => {
    dispatch(fetchCustomerByIdThunk(customerId));
    return () => {
      dispatch(clearSelectedCustomer());
    };
  }, [dispatch, customerId]);

  const handleToggleStatus = useCallback(() => {
    if (!customer) return;
    const isSuspended = customer.status === 'suspended';
    const newStatus = isSuspended ? 'active' : 'suspended';

    Alert.alert(
      isSuspended ? 'Mở khóa khách hàng' : 'Khóa khách hàng',
      isSuspended
        ? 'Bạn có chắc chắn muốn mở khóa tài khoản này?'
        : 'Tài khoản này sẽ bị khóa và không thể đăng nhập. Bạn có chắc chắn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: isSuspended ? 'default' : 'destructive',
          onPress: () => {
            dispatch(updateCustomerStatusThunk({ id: customer._id, status: newStatus }));
          },
        },
      ]
    );
  }, [customer, dispatch]);

  if (isLoading && !customer) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-page">
        <ActivityIndicator size="large" color={Colors.indigo600} />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 bg-page">
        <View className="flex-row items-center gap-3 px-4 py-3">
          <Pressable onPress={() => navigation.goBack()} className="p-2">
            <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">Không tìm thấy khách hàng.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text className="flex-1 text-lg font-extrabold text-slate-900">Chi tiết khách hàng</Text>
        
        <Pressable
          onPress={() => navigation.navigate('CustomerForm', { customerId: customer._id })}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white"
          style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
        >
          <PencilSimple size={20} color={Colors.slate700} weight="bold" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={layoutContainer} contentContainerClassName="px-6 pb-12 pt-4">
        {error && (
          <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm font-semibold text-red-600">{error}</Text>
          </View>
        )}

        <View className="mb-6 items-center">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-indigo-50">
            <User size={48} color={Colors.indigo600} weight="fill" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-900">{customer.name || 'Chưa cập nhật tên'}</Text>
          <Text className="mt-1 text-base font-medium text-slate-500">{customer.phone}</Text>
          
          <View className="mt-3 flex-row gap-2">
            {customer.status === 'active' ? (
              <View className="rounded bg-green-50 px-2.5 py-1">
                <Text className="text-xs font-bold text-green-700 uppercase">HOẠT ĐỘNG</Text>
              </View>
            ) : (
              <View className="rounded bg-red-50 px-2.5 py-1">
                <Text className="text-xs font-bold text-red-700 uppercase">ĐÃ KHÓA</Text>
              </View>
            )}
            {customer.isVerified && (
              <View className="rounded bg-indigo-50 px-2.5 py-1">
                <Text className="text-xs font-bold text-indigo-700 uppercase">ĐÃ XÁC THỰC</Text>
              </View>
            )}
          </View>
        </View>

        <View className="mb-6 rounded-2xl border border-slate-100 bg-white p-5" style={shadowCard}>
          <Text className="mb-4 text-slate-400" style={labelStyle}>
            THÔNG TIN LIÊN LẠC
          </Text>
          <InfoRow icon={Phone} label="Số điện thoại" value={customer.phone} />
          {customer.email && <InfoRow icon={Envelope} label="Email" value={customer.email} />}
          {customer.address && <InfoRow icon={MapPin} label="Địa chỉ" value={customer.address} />}
          {customer.note && <InfoRow icon={CircleDashed} label="Ghi chú" value={customer.note} />}
        </View>

        {/* Change Status Button */}
        <Pressable
          onPress={handleToggleStatus}
          disabled={isLoading}
          className={`flex-row items-center justify-center rounded-xl py-4 ${
            customer.status === 'suspended' ? 'bg-slate-900' : 'bg-red-50'
          }`}
          style={({ pressed }) => [
            pressedStyleSmall(pressed),
            customer.status === 'suspended' ? shadowCTA : undefined,
            { opacity: isLoading ? 0.5 : 1 }
          ]}
        >
          {customer.status === 'suspended' ? (
            <>
              <PlayCircle size={20} color="#fff" weight="bold" />
              <Text className="ml-2 text-base font-bold text-white">Mở khóa tài khoản</Text>
            </>
          ) : (
            <>
              <StopCircle size={20} color="#DC2626" weight="bold" />
              <Text className="ml-2 text-base font-bold text-red-600">Khóa tài khoản</Text>
            </>
          )}
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
