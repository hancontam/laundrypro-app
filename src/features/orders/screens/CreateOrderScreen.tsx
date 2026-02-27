// src/features/orders/screens/CreateOrderScreen.tsx
// Staff/Admin — Create order with auto customer provisioning
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import {
  ArrowLeft,
  ShoppingCart,
  Phone,
  User,
  MapPin,
  Note,
  Plus,
  Minus,
  CheckCircle,
  Broom,
} from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { createOrderThunk, clearOrderError } from '../ordersSlice';
import { fetchServicesThunk } from '@/features/services/servicesSlice';
import {
  Colors,
  shadowCTA,
  shadowCard,
  shadowFloating,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
  labelStyle,
} from '@/theme/tokens';
import type { Service } from '@/features/services/types';
import type { CreateOrderItemPayload } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MainStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
  CreateOrder: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'CreateOrder'>;
};

// ─── Selected service item ───────────────────────────────────────
interface SelectedItem {
  service: Service;
  quantity: number;
}

// ─── Service selector row ────────────────────────────────────────
function ServiceRow({
  service,
  quantity,
  onAdd,
  onRemove,
}: {
  service: Service;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const isSelected = quantity > 0;
  return (
    <View
      className={`mb-2 flex-row items-center rounded-xl border p-3 ${
        isSelected ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 bg-white'
      }`}
    >
      {/* Service info */}
      <View className="mr-2 h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
        <Broom size={18} color={Colors.slate500} weight="bold" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
          {service.name}
        </Text>
        <Text className="text-xs font-medium text-slate-500">
          {service.price?.toLocaleString('vi-VN')}đ / {service.unit}
        </Text>
      </View>

      {/* Quantity controls */}
      <View className="flex-row items-center gap-2">
        {quantity > 0 && (
          <Pressable
            onPress={onRemove}
            className="h-8 w-8 items-center justify-center rounded-lg bg-slate-200"
          >
            <Minus size={16} color={Colors.slate700} weight="bold" />
          </Pressable>
        )}
        {quantity > 0 && (
          <Text className="w-6 text-center text-sm font-bold text-slate-900">
            {quantity}
          </Text>
        )}
        <Pressable
          onPress={onAdd}
          className={`h-8 w-8 items-center justify-center rounded-lg ${
            isSelected ? 'bg-indigo-600' : 'bg-slate-900'
          }`}
        >
          <Plus size={16} color="#fff" weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────
export default function CreateOrderScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.orders);
  const { list: services, isLoading: servicesLoading } = useAppSelector(
    (s) => s.services,
  );

  // ── Form state ──
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(
    new Map(),
  );

  // ── Load services ──
  useEffect(() => {
    if (services.length === 0) {
      dispatch(fetchServicesThunk({ active: 'true' }));
    }
  }, [dispatch, services.length]);

  // ── Active services only ──
  const activeServices = useMemo(
    () => services.filter((s) => s.active !== false),
    [services],
  );

  // ── Item handlers ──
  const handleAddItem = useCallback(
    (service: Service) => {
      setSelectedItems((prev) => {
        const next = new Map(prev);
        const existing = next.get(service._id);
        if (existing) {
          next.set(service._id, { ...existing, quantity: existing.quantity + 1 });
        } else {
          next.set(service._id, { service, quantity: 1 });
        }
        return next;
      });
    },
    [],
  );

  const handleRemoveItem = useCallback(
    (serviceId: string) => {
      setSelectedItems((prev) => {
        const next = new Map(prev);
        const existing = next.get(serviceId);
        if (existing && existing.quantity > 1) {
          next.set(serviceId, { ...existing, quantity: existing.quantity - 1 });
        } else {
          next.delete(serviceId);
        }
        return next;
      });
    },
    [],
  );

  // ── Computed values ──
  const itemsArray = useMemo(() => Array.from(selectedItems.values()), [selectedItems]);
  const totalPrice = useMemo(
    () =>
      itemsArray.reduce(
        (sum, item) => sum + item.service.price * item.quantity,
        0,
      ),
    [itemsArray],
  );

  const isValid =
    customerPhone.trim().length >= 10 &&
    customerName.trim().length >= 1 &&
    itemsArray.length > 0;

  // ── Submit ──
  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    dispatch(clearOrderError());

    const phone = customerPhone.trim().startsWith('+')
      ? customerPhone.trim()
      : `+84${customerPhone.trim().replace(/^0/, '')}`;

    const items: CreateOrderItemPayload[] = itemsArray.map((item) => ({
      serviceId: item.service._id,
      quantity: item.quantity,
      unitPrice: item.service.price,
    }));

    const payload: any = {
      customerPhone: phone,
      customerName: customerName.trim(),
      items,
    };
    if (customerAddress.trim()) payload.customerAddress = customerAddress.trim();
    if (orderNote.trim()) payload.note = orderNote.trim();

    const result = await dispatch(createOrderThunk(payload));
    if (createOrderThunk.fulfilled.match(result)) {
      const message = result.payload.message || 'Tạo đơn hàng thành công';
      Alert.alert('Thành công', message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [
    isValid,
    customerPhone,
    customerName,
    customerAddress,
    orderNote,
    itemsArray,
    dispatch,
    navigation,
  ]);

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
          Tạo đơn hàng
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
          {/* Error */}
          {error && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>
          )}

          {/* Info banner */}
          <View className="mb-6 rounded-xl bg-indigo-50 px-4 py-3">
            <Text className="text-sm font-semibold text-indigo-700">
              Nếu khách hàng chưa có tài khoản, hệ thống sẽ tự động tạo. Khách
              cần đăng nhập OTP lần đầu để kích hoạt.
            </Text>
          </View>

          {/* ── Customer info card ── */}
          <View
            className="mb-5 rounded-2xl border border-slate-100 bg-white p-4"
            style={shadowCard}
          >
            <Text className="mb-3 text-slate-400" style={labelStyle}>
              THÔNG TIN KHÁCH HÀNG
            </Text>

            {/* Phone */}
            <View className="mb-4">
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <Phone size={18} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3 text-base font-semibold text-slate-900"
                  placeholder="0901234567 *"
                  placeholderTextColor={Colors.slate300}
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>
            </View>

            {/* Name */}
            <View className="mb-4">
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <User size={18} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3 text-base font-semibold text-slate-900"
                  placeholder="Tên khách hàng *"
                  placeholderTextColor={Colors.slate300}
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>
            </View>

            {/* Address (optional) */}
            <View>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <MapPin size={18} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3 text-base font-semibold text-slate-900"
                  placeholder="Địa chỉ (tùy chọn)"
                  placeholderTextColor={Colors.slate300}
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                />
              </View>
            </View>
          </View>

          {/* ── Services selector ── */}
          <View
            className="mb-5 rounded-2xl border border-slate-100 bg-white p-4"
            style={shadowCard}
          >
            <Text className="mb-3 text-slate-400" style={labelStyle}>
              CHỌN DỊCH VỤ *
            </Text>

            {servicesLoading ? (
              <View className="py-6">
                <ActivityIndicator color={Colors.indigo600} />
              </View>
            ) : activeServices.length === 0 ? (
              <Text className="py-4 text-center text-sm font-medium text-slate-400">
                Không có dịch vụ khả dụng
              </Text>
            ) : (
              activeServices.map((service) => (
                <ServiceRow
                  key={service._id}
                  service={service}
                  quantity={selectedItems.get(service._id)?.quantity || 0}
                  onAdd={() => handleAddItem(service)}
                  onRemove={() => handleRemoveItem(service._id)}
                />
              ))
            )}
          </View>

          {/* ── Order summary ── */}
          {itemsArray.length > 0 && (
            <View
              className="mb-5 rounded-2xl border border-slate-100 bg-white p-4"
              style={shadowCard}
            >
              <Text className="mb-3 text-slate-400" style={labelStyle}>
                TÓM TẮT ĐƠN HÀNG
              </Text>
              {itemsArray.map((item) => (
                <View
                  key={item.service._id}
                  className="mb-2 flex-row items-center justify-between"
                >
                  <Text
                    className="flex-1 text-sm font-medium text-slate-700"
                    numberOfLines={1}
                  >
                    {item.service.name} × {item.quantity}
                  </Text>
                  <Text className="text-sm font-bold text-slate-900">
                    {(item.service.price * item.quantity).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              ))}
              <View className="mt-2 border-t border-slate-100 pt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-extrabold text-slate-900">
                    Tổng cộng
                  </Text>
                  <Text className="text-lg font-extrabold text-indigo-600">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Note ── */}
          <View className="mb-8">
            <Text className="mb-2 text-slate-400" style={labelStyle}>
              GHI CHÚ (TÙY CHỌN)
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
              <TextInput
                className="py-3 text-base font-semibold text-slate-900"
                placeholder="Ghi chú cho đơn hàng..."
                placeholderTextColor={Colors.slate300}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={orderNote}
                onChangeText={setOrderNote}
              />
            </View>
          </View>

          {/* ── Submit ── */}
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
                <ShoppingCart size={20} color="#fff" weight="bold" />
                <Text className="ml-2 text-base font-bold text-white">
                  Tạo đơn hàng
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
