// src/features/services/screens/ServiceFormScreen.tsx
// Admin only — Create / Edit service form
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FloppyDisk } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  createServiceThunk,
  updateServiceThunk,
  fetchServiceByIdThunk,
  clearServiceError,
  clearSelectedService,
} from '../servicesSlice';
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
import type { RouteProp } from '@react-navigation/native';

type MainStackParamList = {
  Home: undefined;
  ServiceList: undefined;
  ServiceDetail: { serviceId: string };
  ServiceForm: { serviceId?: string } | undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ServiceForm'>;
  route: RouteProp<MainStackParamList, 'ServiceForm'>;
};

export default function ServiceFormScreen({ navigation, route }: Props) {
  const serviceId = route.params?.serviceId;
  const isEdit = !!serviceId;

  const dispatch = useAppDispatch();
  const { selectedService, isLoading, error } = useAppSelector(
    (s) => s.services,
  );

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [active, setActive] = useState(true);

  // Load existing service for edit mode
  useEffect(() => {
    if (isEdit && serviceId) {
      dispatch(fetchServiceByIdThunk(serviceId));
    }
    return () => {
      dispatch(clearSelectedService());
    };
  }, [dispatch, isEdit, serviceId]);

  // Populate form when service loads
  useEffect(() => {
    if (isEdit && selectedService) {
      setName(selectedService.name);
      setCategory(selectedService.category);
      setPrice(String(selectedService.price));
      setUnit(selectedService.unit);
      setActive(selectedService.active);
    }
  }, [isEdit, selectedService]);

  const isValid = name.trim() && category.trim() && price.trim() && unit.trim();

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    dispatch(clearServiceError());

    const payload = {
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      unit: unit.trim(),
      active,
    };

    if (isEdit && serviceId) {
      const result = await dispatch(
        updateServiceThunk({ id: serviceId, payload }),
      );
      if (updateServiceThunk.fulfilled.match(result)) {
        navigation.goBack();
      }
    } else {
      const result = await dispatch(createServiceThunk(payload));
      if (createServiceThunk.fulfilled.match(result)) {
        navigation.goBack();
      }
    }
  }, [name, category, price, unit, active, isEdit, serviceId, isValid, dispatch, navigation]);

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
          {isEdit ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}
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

          {/* §3.3 — Name */}
          <View className="mb-5">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              TÊN DỊCH VỤ *
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
              <TextInput
                className="py-3.5 text-base font-semibold text-slate-900"
                placeholder="VD: Giặt thường"
                placeholderTextColor={Colors.slate300}
                value={name}
                onChangeText={setName}
                autoFocus={!isEdit}
              />
            </View>
          </View>

          {/* Category */}
          <View className="mb-5">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              DANH MỤC *
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
              <TextInput
                className="py-3.5 text-base font-semibold text-slate-900"
                placeholder="VD: Giặt sấy"
                placeholderTextColor={Colors.slate300}
                value={category}
                onChangeText={setCategory}
              />
            </View>
          </View>

          {/* Price + Unit in row */}
          <View className="mb-5 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                GIÁ (VND) *
              </Text>
              <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
                <TextInput
                  className="py-3.5 text-base font-semibold text-slate-900"
                  placeholder="15000"
                  placeholderTextColor={Colors.slate300}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                ĐƠN VỊ *
              </Text>
              <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
                <TextInput
                  className="py-3.5 text-base font-semibold text-slate-900"
                  placeholder="kg"
                  placeholderTextColor={Colors.slate300}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>
          </View>

          {/* Active toggle */}
          <View className="mb-8 flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Text className="text-sm font-bold text-slate-700">
              Hoạt động
            </Text>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: Colors.slate200, true: Colors.indigo500 }}
              thumbColor="#fff"
            />
          </View>

          {/* Submit */}
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
                <FloppyDisk size={20} color="#fff" weight="bold" />
                <Text className="ml-2 text-base font-bold text-white">
                  {isEdit ? 'Cập nhật' : 'Tạo dịch vụ'}
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
