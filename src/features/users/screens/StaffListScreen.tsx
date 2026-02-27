// src/features/users/screens/StaffListScreen.tsx
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
import { UserCircle, CaretRight, Plus, UsersThree } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchStaffThunk, loadMoreStaffThunk } from '../usersSlice';
import {
  Colors,
  shadowCard,
  shadowCTA,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
} from '@/theme/tokens';
import type { UserProfile, UserStatus } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MainStackParamList = {
  StaffList: undefined;
  StaffDetail: { userId: string };
  CreateStaff: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'StaffList'>;
};

// ─── Status badge ────────────────────────────────────────────────
const STATUS_CONFIG: Record<UserStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Hoạt động', bg: 'bg-green-50', text: 'text-green-700' },
  suspended: { label: 'Đình chỉ', bg: 'bg-red-50', text: 'text-red-600' },
};

function StatusBadge({ status }: { status: UserStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <View className={`rounded-lg px-2.5 py-1 ${config.bg}`}>
      <Text className={`text-xs font-bold ${config.text}`}>{config.label}</Text>
    </View>
  );
}

// ─── Staff card ──────────────────────────────────────────────────
function StaffCard({
  user,
  onPress,
}: {
  user: UserProfile;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4"
      style={({ pressed }) => [shadowCard, pressedStyle(pressed)]}
    >
      {/* Avatar */}
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
        <UserCircle size={28} color={Colors.indigo600} weight="bold" />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">
          {user.name || '—'}
        </Text>
        <Text className="mt-0.5 text-xs font-medium text-slate-500">
          {user.phone}
        </Text>
      </View>

      {/* Status + Arrow */}
      <StatusBadge status={user.status} />
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
        <UsersThree size={32} color={Colors.indigo600} weight="bold" />
      </View>
      <Text className="text-lg font-extrabold text-slate-900">
        Chưa có nhân viên
      </Text>
      <Text className="mt-2 text-sm font-medium text-slate-500">
        Thêm nhân viên mới bằng nút bên dưới
      </Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────
export default function StaffListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { list, pagination, isLoading, isLoadingMore, error } = useAppSelector(
    (s) => s.users,
  );

  useEffect(() => {
    dispatch(fetchStaffThunk(undefined));
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchStaffThunk(undefined));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && pagination.page < pagination.totalPages) {
      dispatch(loadMoreStaffThunk(undefined));
    }
  }, [dispatch, isLoadingMore, pagination]);

  const renderItem = useCallback(
    ({ item }: { item: UserProfile }) => (
      <StaffCard
        user={item}
        onPress={() =>
          navigation.navigate('StaffDetail', { userId: item._id })
        }
      />
    ),
    [navigation],
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
      <View className="px-6 pb-2 pt-4">
        <Text className="text-2xl font-extrabold text-slate-900">Nhân viên</Text>
      </View>

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

      {/* FAB — Admin only (this screen is already admin-gated) */}
      <Pressable
        onPress={() => navigation.navigate('CreateStaff')}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-slate-900"
        style={({ pressed }) => [shadowCTA, pressedStyleSmall(pressed)]}
      >
        <Plus size={24} color="#fff" weight="bold" />
      </Pressable>
    </SafeAreaView>
  );
}
