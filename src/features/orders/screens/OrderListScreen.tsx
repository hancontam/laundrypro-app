// src/features/orders/screens/OrderListScreen.tsx
import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardText, CaretRight, Package, Plus } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchOrdersThunk, loadMoreOrdersThunk } from '../ordersSlice';
import {
  Colors,
  shadowCard,
  shadowCTA,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
  labelStyle,
} from '@/theme/tokens';
import type { Order, OrderStatus } from '../types';
import type { User } from '@/features/auth/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MainStackParamList = {
  Home: undefined;
  OrderList: undefined;
  OrderDetail: { orderId: string };
  CreateOrder: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'OrderList'>;
};

// ─── Status badge ────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Chờ xử lý', bg: 'bg-amber-50', text: 'text-amber-700' },
  completed: { label: 'Hoàn thành', bg: 'bg-green-50', text: 'text-green-700' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <View className={`rounded-lg px-2.5 py-1 ${config.bg}`}>
      <Text className={`text-xs font-bold ${config.text}`}>{config.label}</Text>
    </View>
  );
}

// ─── Format helpers ──────────────────────────────────────────────
function formatPrice(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Order card ──────────────────────────────────────────────────
function OrderCard({
  order,
  currentUser,
  onPress,
}: {
  order: Order;
  currentUser?: User | null;
  onPress: () => void;
}) {
  // If order.customerId is missing or unpopulated string, fallback to currentUser (if they are a customer)
  const isPopulatedCustomer = order.customerId && typeof order.customerId === 'object';
  const displayCustomerName = isPopulatedCustomer
    ? order.customerId.name || order.customerId.phone
    : currentUser?.name || currentUser?.phone || '—';
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl border border-slate-100 bg-white p-4"
      style={({ pressed }) => [shadowCard, pressedStyle(pressed)]}
    >
      {/* Header: ID + Status */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-bold text-slate-400">
          #{order._id.slice(-8).toUpperCase()}
        </Text>
        <StatusBadge status={order.status} />
      </View>

      {/* Customer name */}
      <Text className="mb-1 text-base font-bold text-slate-900">
        {displayCustomerName}
      </Text>

      {/* Items count + Total */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-500">
          {order.orderItems?.length || 0} dịch vụ
        </Text>
        <Text className="text-base font-extrabold text-indigo-600">
          {formatPrice(order.totalPrice)}
        </Text>
      </View>

      {/* Footer: Date + Arrow */}
      <View className="flex-row items-center justify-between border-t border-slate-100 pt-2">
        <Text className="text-xs font-medium text-slate-400">
          {formatDate(order.createdAt)}
        </Text>
        <CaretRight size={16} color={Colors.slate400} weight="bold" />
      </View>
    </Pressable>
  );
}

// ─── Empty state ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <Package size={32} color={Colors.indigo600} weight="bold" />
      </View>
      <Text className="text-lg font-extrabold text-slate-900">
        Chưa có đơn hàng
      </Text>
      <Text className="mt-2 text-sm font-medium text-slate-500">
        Các đơn hàng sẽ hiển thị ở đây
      </Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────
export default function OrderListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { list, pagination, isLoading, isLoadingMore, error } = useAppSelector(
    (state) => state.orders,
  );
  const { user } = useAppSelector((state) => state.auth);
  const canCreate = user?.role === 'staff' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchOrdersThunk(undefined));
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchOrdersThunk(undefined));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && pagination.page < pagination.totalPages) {
      dispatch(loadMoreOrdersThunk(undefined));
    }
  }, [dispatch, isLoadingMore, pagination]);

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard
        order={item}
        currentUser={user}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
      />
    ),
    [navigation, user],
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator color={Colors.indigo600} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-page">
      {/* §3.2 — Page title */}
      <View className="px-6 pb-2 pt-4">
        <Text className="text-2xl font-extrabold text-slate-900">Đơn hàng</Text>
      </View>

      {/* Error */}
      {error && (
        <View className="mx-6 mb-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>
      )}

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[layoutContainer, { paddingHorizontal: 24 }]}
        contentContainerClassName="pb-24"
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[Colors.indigo600]}
            tintColor={Colors.indigo600}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
      />

      {/* FAB — Staff/Admin only */}
      {canCreate && (
        <Pressable
          onPress={() => navigation.navigate('CreateOrder')}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-slate-900"
          style={({ pressed }) => [shadowCTA, pressedStyleSmall(pressed)]}
        >
          <Plus size={24} color="#fff" weight="bold" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}
