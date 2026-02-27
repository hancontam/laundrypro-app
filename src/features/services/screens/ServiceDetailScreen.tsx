// src/features/services/screens/ServiceDetailScreen.tsx
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
  Broom,
  Tag,
  CurrencyDollar,
  Ruler,
  PencilSimple,
  Trash,
  CheckCircle,
  XCircle,
} from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  fetchServiceByIdThunk,
  deleteServiceThunk,
  clearSelectedService,
  clearServiceError,
} from '../servicesSlice';
import {
  Colors,
  shadowCard,
  shadowOutline,
  shadowFloating,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
  labelStyle,
} from '@/theme/tokens';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type MainStackParamList = {
  Home: undefined;
  ServiceList: undefined;
  ServiceDetail: { serviceId: string };
  ServiceForm: { serviceId?: string } | undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ServiceDetail'>;
  route: RouteProp<MainStackParamList, 'ServiceDetail'>;
};

function formatPrice(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

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
  icon: typeof Tag;
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

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const { serviceId } = route.params;
  const dispatch = useAppDispatch();
  const { selectedService, isLoading, error } = useAppSelector(
    (s) => s.services,
  );
  const userRole = useAppSelector((s) => s.auth.user?.role);
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    dispatch(fetchServiceByIdThunk(serviceId));
    return () => {
      dispatch(clearSelectedService());
    };
  }, [dispatch, serviceId]);

  const handleDelete = useCallback(() => {
    if (!selectedService) return;
    Alert.alert('Xoá dịch vụ', `Bạn có chắc muốn xoá "${selectedService.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          dispatch(clearServiceError());
          const result = await dispatch(deleteServiceThunk(selectedService._id));
          if (deleteServiceThunk.fulfilled.match(result)) {
            navigation.goBack();
          }
        },
      },
    ]);
  }, [selectedService, dispatch, navigation]);

  if (isLoading && !selectedService) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-page">
        <ActivityIndicator size="large" color={Colors.indigo600} />
      </SafeAreaView>
    );
  }

  const service = selectedService;

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
          Chi tiết dịch vụ
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View className="mx-6 mb-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>
      )}

      {service && (
        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="px-6 pb-8"
        >
          {/* Service icon + name */}
          <View className="mb-6 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
              <Broom size={40} color={Colors.indigo600} weight="bold" />
            </View>
            <Text className="text-xl font-extrabold text-slate-900">
              {service.name}
            </Text>
            <View className="mt-2 flex-row items-center gap-1.5">
              {service.active ? (
                <CheckCircle size={16} color="#22C55E" weight="fill" />
              ) : (
                <XCircle size={16} color="#DC2626" weight="fill" />
              )}
              <Text
                className="text-sm font-bold"
                style={{ color: service.active ? '#22C55E' : '#DC2626' }}
              >
                {service.active ? 'Đang hoạt động' : 'Ngưng hoạt động'}
              </Text>
            </View>
          </View>

          {/* Info card */}
          <SectionCard title="THÔNG TIN">
            <InfoRow icon={Tag} label="Danh mục" value={service.category} />
            <InfoRow
              icon={CurrencyDollar}
              label="Giá"
              value={formatPrice(service.price)}
              valueColor={Colors.indigo600}
            />
            <InfoRow icon={Ruler} label="Đơn vị" value={service.unit} />
          </SectionCard>

          {/* Admin actions */}
          {isAdmin && (
            <View className="mt-2 gap-3">
              {/* Edit */}
              <Pressable
                onPress={() =>
                  navigation.navigate('ServiceForm', {
                    serviceId: service._id,
                  })
                }
                className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5"
                style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}
              >
                <PencilSimple size={20} color={Colors.slate700} weight="bold" />
                <Text className="text-sm font-bold text-slate-700">
                  Chỉnh sửa
                </Text>
              </Pressable>

              {/* Delete */}
              <Pressable
                onPress={handleDelete}
                disabled={isLoading}
                className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-white px-6 py-3.5"
                style={({ pressed }) => [
                  pressedStyleSmall(pressed),
                  { opacity: isLoading ? 0.5 : 1 },
                ]}
              >
                <Trash size={20} color="#DC2626" weight="bold" />
                <Text className="text-sm font-bold text-red-600">Xoá dịch vụ</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
