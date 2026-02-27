// src/features/orders/screens/OrderDetailScreen.tsx
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Receipt,
  User,
  CreditCard,
  CheckCircle,
  ClockCountdown,
  XCircle,
  ArrowCounterClockwise,
} from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  fetchOrderByIdThunk,
  updateOrderStatusThunk,
  clearSelectedOrder,
  clearOrderError,
} from '../ordersSlice';
import {
  Colors,
  shadowCard,
  shadowCTA,
  shadowFloating,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
  labelStyle,
} from '@/theme/tokens';
import type { Order, OrderItem, Payment, OrderStatus, PaymentStatus } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type MainStackParamList = {
  Home: undefined;
  OrderList: undefined;
  OrderDetail: { orderId: string };
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'OrderDetail'>;
  route: RouteProp<MainStackParamList, 'OrderDetail'>;
};

// ─── Formatters ──────────────────────────────────────────────────
function formatPrice(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Status badge config ─────────────────────────────────────────
const ORDER_STATUS: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Chờ xử lý', bg: 'bg-amber-50', text: 'text-amber-700' },
  completed: { label: 'Hoàn thành', bg: 'bg-green-50', text: 'text-green-700' },
};

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  pending: { label: 'Chờ thanh toán', icon: ClockCountdown, color: Colors.slate500 },
  paid: { label: 'Đã thanh toán', icon: CheckCircle, color: '#22C55E' },
  failed: { label: 'Thất bại', icon: XCircle, color: '#DC2626' },
  refunded: { label: 'Hoàn tiền', icon: ArrowCounterClockwise, color: Colors.slate500 },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'Tiền mặt',
  momo: 'MoMo',
  vnpay: 'VNPay',
  bank: 'Chuyển khoản',
};

// ─── Section card ────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      className="mb-4 rounded-2xl border border-slate-100 bg-white p-4"
      style={shadowCard}
    >
      <Text className="mb-3 text-slate-400" style={labelStyle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

// ─── Item row ────────────────────────────────────────────────────
function ItemRow({ item }: { item: OrderItem }) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
      <View className="flex-1">
        <Text className="text-sm font-bold text-slate-900">{item.serviceName}</Text>
        <Text className="mt-0.5 text-xs font-medium text-slate-400">
          {item.serviceCategory} · {item.quantity} {item.serviceUnit} × {formatPrice(item.unitPrice)}
        </Text>
        {item.note ? (
          <Text className="mt-1 text-xs font-medium text-slate-400 italic">
            {item.note}
          </Text>
        ) : null}
      </View>
      <Text className="text-sm font-extrabold text-slate-900">
        {formatPrice(item.totalPrice)}
      </Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────
export default function OrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const dispatch = useAppDispatch();
  const { selectedOrder, isLoading, error } = useAppSelector((s) => s.orders);
  const userRole = useAppSelector((s) => s.auth.user?.role);

  useEffect(() => {
    dispatch(fetchOrderByIdThunk(orderId));
    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, orderId]);

  const canUpdateStatus =
    selectedOrder?.status === 'pending' &&
    (userRole === 'staff' || userRole === 'admin');

  const handleCompleteOrder = useCallback(() => {
    if (!selectedOrder) return;
    Alert.alert(
      'Hoàn thành đơn hàng',
      'Bạn có chắc muốn đánh dấu đơn hàng này là hoàn thành?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            dispatch(clearOrderError());
            dispatch(
              updateOrderStatusThunk({ id: selectedOrder._id, status: 'completed' }),
            );
          },
        },
      ],
    );
  }, [selectedOrder, dispatch]);

  if (isLoading && !selectedOrder) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-page">
        <ActivityIndicator size="large" color={Colors.indigo600} />
      </SafeAreaView>
    );
  }

  const order = selectedOrder;

  return (
    <SafeAreaView className="flex-1 bg-page">
      {/* §5.2 Header with back button */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white"
          style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
        >
          <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
        </Pressable>
        <Text className="flex-1 text-lg font-extrabold text-slate-900">
          Chi tiết đơn hàng
        </Text>
        {order && (
          <View className={`rounded-lg px-2.5 py-1 ${ORDER_STATUS[order.status].bg}`}>
            <Text className={`text-xs font-bold ${ORDER_STATUS[order.status].text}`}>
              {ORDER_STATUS[order.status].label}
            </Text>
          </View>
        )}
      </View>

      {/* Error */}
      {error && (
        <View className="mx-6 mb-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>
      )}

      {order && (
        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="px-6 pb-8"
        >
          {/* ── Order ID + Date ── */}
          <SectionCard title="THÔNG TIN ĐƠN">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-slate-500">Mã đơn</Text>
              <Text className="text-sm font-bold text-slate-900">
                #{order._id.slice(-8).toUpperCase()}
              </Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-slate-500">Ngày tạo</Text>
              <Text className="text-sm font-semibold text-slate-700">
                {formatDate(order.createdAt)}
              </Text>
            </View>
            {order.completedAt && (
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-slate-500">Hoàn thành</Text>
                <Text className="text-sm font-semibold text-green-600">
                  {formatDate(order.completedAt)}
                </Text>
              </View>
            )}
            {order.note ? (
              <View className="mt-3 rounded-xl bg-slate-50 p-3">
                <Text className="text-sm font-medium text-slate-600 italic">
                  {order.note}
                </Text>
              </View>
            ) : null}
          </SectionCard>

          {/* ── Customer info ── */}
          <SectionCard title="KHÁCH HÀNG">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <User size={20} color={Colors.indigo600} weight="bold" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">
                  {order.customerId?.name || '—'}
                </Text>
                <Text className="text-xs font-medium text-slate-500">
                  {order.customerId?.phone}
                </Text>
              </View>
            </View>

            {/* Account Status */}
            {(order.customerId?.isVerified !== undefined || order.customerId?.hasPassword !== undefined) && (
              <View className="mt-4 flex-row items-center gap-2 border-t border-slate-100 pt-3">
                {order.customerId.isVerified ? (
                  <View className="rounded bg-green-50 px-2 py-1">
                    <Text className="text-[10px] font-bold text-green-700">ĐÃ XÁC THỰC</Text>
                  </View>
                ) : (
                  <View className="rounded bg-red-50 px-2 py-1">
                    <Text className="text-[10px] font-bold text-red-700">CHƯA XÁC THỰC</Text>
                  </View>
                )}
                
                {order.customerId.hasPassword ? (
                  <View className="rounded bg-indigo-50 px-2 py-1">
                    <Text className="text-[10px] font-bold text-indigo-700">ĐÃ TẠO MẬT KHẨU</Text>
                  </View>
                ) : (
                  <View className="rounded bg-amber-50 px-2 py-1">
                    <Text className="text-[10px] font-bold text-amber-700">CHƯA CÓ MẬT KHẨU</Text>
                  </View>
                )}
              </View>
            )}
          </SectionCard>

          {/* ── Items ── */}
          <SectionCard title="DỊCH VỤ">
            {order.orderItems.map((item) => (
              <ItemRow key={item._id} item={item} />
            ))}
            {/* Total */}
            <View className="mt-3 flex-row items-center justify-between border-t border-slate-200 pt-3">
              <Text className="text-sm font-bold text-slate-900">Tổng cộng</Text>
              <Text className="text-lg font-extrabold text-indigo-600">
                {formatPrice(order.totalPrice)}
              </Text>
            </View>
          </SectionCard>

          {/* ── Payment info ── */}
          <SectionCard title="THANH TOÁN">
            {order.payment ? (
              <PaymentInfo payment={order.payment} />
            ) : (
              <View className="items-center py-4">
                <CreditCard size={24} color={Colors.slate300} weight="bold" />
                <Text className="mt-2 text-sm font-medium text-slate-400">
                  Chưa có thanh toán
                </Text>
              </View>
            )}
          </SectionCard>

          {/* ── Complete button (Staff/Admin only, pending orders) ── */}
          {canUpdateStatus && (
            <Pressable
              onPress={handleCompleteOrder}
              disabled={isLoading}
              className="flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
              style={({ pressed }) => [
                shadowCTA,
                pressedStyle(pressed),
                { opacity: isLoading ? 0.5 : 1 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <CheckCircle size={20} color="#fff" weight="bold" />
                  <Text className="ml-2 text-base font-bold text-white">
                    Hoàn thành đơn hàng
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Payment info sub-component ──────────────────────────────────
function PaymentInfo({ payment }: { payment: Payment }) {
  const statusConfig = PAYMENT_STATUS[payment.status] || PAYMENT_STATUS.pending;
  const Icon = statusConfig.icon;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-500">Phương thức</Text>
        <Text className="text-sm font-bold text-slate-900">
          {PAYMENT_METHOD_LABEL[payment.method] || payment.method}
        </Text>
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-500">Trạng thái</Text>
        <View className="flex-row items-center gap-1.5">
          <Icon size={16} color={statusConfig.color} weight="bold" />
          <Text className="text-sm font-bold" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </Text>
        </View>
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-500">Số tiền</Text>
        <Text className="text-sm font-extrabold text-slate-900">
          {formatPrice(payment.amount)}
        </Text>
      </View>
      {payment.transactionRef && (
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-slate-500">Mã GD</Text>
          <Text className="text-xs font-semibold text-slate-600">
            {payment.transactionRef}
          </Text>
        </View>
      )}
      {payment.paidAt && (
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-slate-500">Thanh toán lúc</Text>
          <Text className="text-sm font-semibold text-slate-700">
            {formatDate(payment.paidAt)}
          </Text>
        </View>
      )}
    </View>
  );
}
