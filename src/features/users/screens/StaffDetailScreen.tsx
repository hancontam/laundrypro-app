// src/features/users/screens/StaffDetailScreen.tsx
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
  UserCircle,
  Phone,
  EnvelopeSimple,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  LockSimple,
} from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  fetchUserByIdThunk,
  updateUserStatusThunk,
  clearSelectedUser,
  clearUserError,
} from '../usersSlice';
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
import type { UserStatus } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type MainStackParamList = {
  StaffList: undefined;
  StaffDetail: { userId: string };
  CreateStaff: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'StaffDetail'>;
  route: RouteProp<MainStackParamList, 'StaffDetail'>;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  active: { label: 'Hoạt động', color: '#22C55E' },
  suspended: { label: 'Đình chỉ', color: '#DC2626' },
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center gap-2">
        <Icon size={18} color={Colors.slate400} weight="bold" />
        <Text className="text-sm font-medium text-slate-500">{label}</Text>
      </View>
      <Text
        className="text-sm font-bold"
        style={{ color: valueColor || Colors.slate900 }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function StaffDetailScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const dispatch = useAppDispatch();
  const { selectedUser, isLoading, error } = useAppSelector((s) => s.users);

  useEffect(() => {
    dispatch(fetchUserByIdThunk(userId));
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, userId]);

  const handleToggleStatus = useCallback(() => {
    if (!selectedUser) return;
    const newStatus: UserStatus =
      selectedUser.status === 'active' ? 'suspended' : 'active';
    const actionLabel =
      newStatus === 'suspended' ? 'đình chỉ' : 'kích hoạt lại';

    Alert.alert(
      `Xác nhận ${actionLabel}`,
      `Bạn có chắc muốn ${actionLabel} nhân viên "${selectedUser.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            dispatch(clearUserError());
            dispatch(
              updateUserStatusThunk({ id: selectedUser._id, status: newStatus }),
            );
          },
        },
      ],
    );
  }, [selectedUser, dispatch]);

  if (isLoading && !selectedUser) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-page">
        <ActivityIndicator size="large" color={Colors.indigo600} />
      </SafeAreaView>
    );
  }

  const user = selectedUser;
  const statusConfig = user
    ? STATUS_CONFIG[user.status] || STATUS_CONFIG.active
    : STATUS_CONFIG.active;

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
          Chi tiết nhân viên
        </Text>
      </View>

      {error && (
        <View className="mx-6 mb-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>
      )}

      {user && (
        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="px-6 pb-8"
        >
          {/* Hero */}
          <View className="mb-6 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
              <UserCircle size={48} color={Colors.indigo600} weight="bold" />
            </View>
            <Text className="text-xl font-extrabold text-slate-900">
              {user.name || '—'}
            </Text>
            <View className="mt-2 flex-row items-center gap-1.5">
              {user.status === 'active' ? (
                <CheckCircle size={16} color="#22C55E" weight="fill" />
              ) : (
                <XCircle size={16} color="#DC2626" weight="fill" />
              )}
              <Text
                className="text-sm font-bold"
                style={{ color: statusConfig.color }}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Contact info */}
          <SectionCard title="THÔNG TIN LIÊN HỆ">
            <InfoRow icon={Phone} label="Số điện thoại" value={user.phone} />
            {user.email && (
              <InfoRow
                icon={EnvelopeSimple}
                label="Email"
                value={user.email}
              />
            )}
            <InfoRow
              icon={Shield}
              label="Vai trò"
              value={user.role === 'staff' ? 'Nhân viên' : user.role}
            />
          </SectionCard>

          {/* Account status */}
          <SectionCard title="TRẠNG THÁI TÀI KHOẢN">
            <InfoRow
              icon={CheckCircle}
              label="Xác thực"
              value={user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
              valueColor={user.isVerified ? '#22C55E' : Colors.slate500}
            />
            <InfoRow
              icon={LockSimple}
              label="Mật khẩu"
              value={user.hasPassword ? 'Đã đặt' : 'Chưa đặt'}
              valueColor={user.hasPassword ? '#22C55E' : Colors.slate500}
            />
            <InfoRow
              icon={Clock}
              label="Ngày tạo"
              value={formatDate(user.createdAt)}
            />
            {user.lastLogin && (
              <InfoRow
                icon={Clock}
                label="Đăng nhập cuối"
                value={formatDate(user.lastLogin)}
              />
            )}
          </SectionCard>

          {/* Toggle status button */}
          <Pressable
            onPress={handleToggleStatus}
            disabled={isLoading}
            className={`flex-row items-center justify-center rounded-xl py-4 ${
              user.status === 'active' ? 'bg-red-600' : 'bg-slate-900'
            }`}
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
                {user.status === 'active' ? (
                  <XCircle size={20} color="#fff" weight="bold" />
                ) : (
                  <CheckCircle size={20} color="#fff" weight="bold" />
                )}
                <Text className="ml-2 text-base font-bold text-white">
                  {user.status === 'active'
                    ? 'Đình chỉ nhân viên'
                    : 'Kích hoạt lại'}
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
