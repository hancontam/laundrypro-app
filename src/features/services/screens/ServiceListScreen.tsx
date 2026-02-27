// src/features/services/screens/ServiceListScreen.tsx
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
import { Broom, CaretRight, Plus, Tag } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchServicesThunk } from '../servicesSlice';
import {
  Colors,
  shadowCard,
  shadowCTA,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
} from '@/theme/tokens';
import type { Service } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MainStackParamList = {
  Home: undefined;
  ServiceList: undefined;
  ServiceDetail: { serviceId: string };
  ServiceForm: { serviceId?: string } | undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ServiceList'>;
};

// ─── Format helpers ──────────────────────────────────────────────
function formatPrice(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

// ─── Service card ────────────────────────────────────────────────
function ServiceCard({
  service,
  onPress,
}: {
  service: Service;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4"
      style={({ pressed }) => [shadowCard, pressedStyle(pressed)]}
    >
      {/* Icon */}
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
        <Broom size={24} color={Colors.indigo600} weight="bold" />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">{service.name}</Text>
        <View className="mt-1 flex-row items-center gap-2">
          <Tag size={14} color={Colors.slate400} weight="bold" />
          <Text className="text-xs font-medium text-slate-500">
            {service.category}
          </Text>
        </View>
      </View>

      {/* Price + Arrow */}
      <View className="items-end">
        <Text className="text-sm font-extrabold text-indigo-600">
          {formatPrice(service.price)}
        </Text>
        <Text className="text-xs font-medium text-slate-400">
          /{service.unit}
        </Text>
      </View>

      <CaretRight
        size={16}
        color={Colors.slate400}
        weight="bold"
        style={{ marginLeft: 8 }}
      />
    </Pressable>
  );
}

// ─── Empty state ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <Broom size={32} color={Colors.indigo600} weight="bold" />
      </View>
      <Text className="text-lg font-extrabold text-slate-900">
        Chưa có dịch vụ
      </Text>
      <Text className="mt-2 text-sm font-medium text-slate-500">
        Danh sách dịch vụ sẽ hiển thị ở đây
      </Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────
export default function ServiceListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { list, isLoading, error } = useAppSelector((s) => s.services);
  const userRole = useAppSelector((s) => s.auth.user?.role);

  useEffect(() => {
    dispatch(fetchServicesThunk(undefined));
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchServicesThunk(undefined));
  }, [dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: Service }) => (
      <ServiceCard
        service={item}
        onPress={() =>
          navigation.navigate('ServiceDetail', { serviceId: item._id })
        }
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView className="flex-1 bg-page">
      {/* Header */}
      <View className="px-6 pb-2 pt-4">
        <Text className="text-2xl font-extrabold text-slate-900">Dịch vụ</Text>
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
      />

      {/* FAB — Admin only */}
      {userRole === 'admin' && (
        <Pressable
          onPress={() => navigation.navigate('ServiceForm', undefined)}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-slate-900"
          style={({ pressed }) => [shadowCTA, pressedStyleSmall(pressed)]}
        >
          <Plus size={24} color="#fff" weight="bold" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}
