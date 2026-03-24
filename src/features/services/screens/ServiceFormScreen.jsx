// Admin only — Create / Edit service form
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, Image, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, FloppyDisk, ImageSquare, Trash, } from 'phosphor-react-native';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { createServiceThunk, updateServiceThunk, fetchServiceByIdThunk, clearServiceError, } from '../servicesSlice';
import { Colors, shadowCTA, shadowFloating, pressedStyle, pressedStyleSmall, layoutContainer, labelStyle, shadowCard, } from '@/theme/tokens';
export default function ServiceFormScreen({ navigation, route }) {
    const serviceId = route.params?.serviceId;
    const isEdit = !!serviceId;
    const dispatch = useAppDispatch();
    const { selectedService, isLoading, error } = useAppSelector((s) => s.services);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('');
    const [active, setActive] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    // Load existing service for edit mode
    useEffect(() => {
        if (isEdit && serviceId) {
            dispatch(fetchServiceByIdThunk(serviceId));
        }
    }, [dispatch, isEdit, serviceId]);
    // Populate form when service loads
    useEffect(() => {
        if (isEdit && selectedService) {
            setName(selectedService.name);
            setCategory(selectedService.category);
            setPrice(String(selectedService.price));
            setUnit(selectedService.unit);
            setActive(selectedService.active);
            setExistingImage(selectedService.image || null);
            setImageFile(null);
            setRemoveImage(false);
        }
        else if (!isEdit) {
            setExistingImage(null);
            setImageFile(null);
            setRemoveImage(false);
        }
    }, [isEdit, selectedService]);
    const previewImageUri = imageFile?.uri ||
        (!removeImage ? existingImage : null);
    const isValid = name.trim() && category.trim() && price.trim() && unit.trim();
    const handlePickImage = useCallback(async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Chưa có quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh để chọn hình cho dịch vụ.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (result.canceled || !result.assets.length)
            return;
        const asset = result.assets[0];
        setImageFile({
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: asset.fileName || `service-${Date.now()}.jpg`,
        });
        setRemoveImage(false);
    }, []);
    const handleRemoveImage = useCallback(() => {
        setImageFile(null);
        if (existingImage) {
            setRemoveImage(true);
        }
    }, [existingImage]);
    const handleSubmit = useCallback(async () => {
        if (!isValid)
            return;
        dispatch(clearServiceError());
        const payload = {
            name: name.trim(),
            category: category.trim(),
            price: Number(price),
            unit: unit.trim(),
            active,
            ...(imageFile ? { image: imageFile } : {}),
        };
        if (isEdit && serviceId) {
            const result = await dispatch(updateServiceThunk({
                id: serviceId,
                payload: {
                    ...payload,
                    ...(removeImage && !imageFile ? { removeImage: true } : {}),
                },
            }));
            if (updateServiceThunk.fulfilled.match(result)) {
                navigation.goBack();
            }
        }
        else {
            const result = await dispatch(createServiceThunk(payload));
            if (createServiceThunk.fulfilled.match(result)) {
                navigation.goBack();
            }
        }
    }, [
        name,
        category,
        price,
        unit,
        active,
        imageFile,
        removeImage,
        isEdit,
        serviceId,
        isValid,
        dispatch,
        navigation,
    ]);
    return (<SafeAreaView className="flex-1 bg-page">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} className="h-10 w-10 items-center justify-center rounded-xl bg-white" style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}>
          <ArrowLeft size={20} color={Colors.slate700} weight="bold"/>
        </Pressable>
        <Text className="flex-1 text-lg font-extrabold text-slate-900">
          {isEdit ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={layoutContainer} contentContainerClassName="px-6 pb-8" keyboardShouldPersistTaps="handled">
          {/* Error */}
          {error && (<View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>)}

          <View className="mb-5 rounded-2xl border border-slate-100 bg-white p-4" style={shadowCard}>
            <Text className="mb-3 text-slate-500" style={labelStyle}>
              HÌNH ẢNH
            </Text>

            {previewImageUri ? (<Image source={{ uri: previewImageUri }} className="h-48 w-full rounded-2xl bg-slate-100" resizeMode="cover"/>) : (<View className="h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                  <ImageSquare size={28} color={Colors.indigo600} weight="bold"/>
                </View>
                <Text className="text-sm font-bold text-slate-700">
                  Chưa có hình cho dịch vụ
                </Text>
                <Text className="mt-1 text-center text-xs font-medium leading-5 text-slate-500">
                  Bạn có thể thêm ảnh minh họa khi tạo hoặc cập nhật dịch vụ.
                </Text>
              </View>)}

            <View className="mt-4 flex-row gap-3">
              <Pressable onPress={handlePickImage} className="flex-1 flex-row items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" style={({ pressed }) => pressedStyleSmall(pressed)}>
                <ImageSquare size={18} color={Colors.slate700} weight="bold"/>
                <Text className="ml-2 text-sm font-bold text-slate-700">
                  {previewImageUri ? 'Thay ảnh' : 'Chọn ảnh'}
                </Text>
              </Pressable>

              {previewImageUri && (<Pressable onPress={handleRemoveImage} className="flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3" style={({ pressed }) => pressedStyleSmall(pressed)}>
                  <Trash size={18} color={Colors.red600} weight="bold"/>
                  <Text className="ml-2 text-sm font-bold text-red-600">
                    Xóa
                  </Text>
                </Pressable>)}
            </View>

            <Text className="mt-4 text-xs font-medium leading-5 text-slate-500">
              Chọn ảnh từ thư viện để thêm hình minh họa cho dịch vụ.
            </Text>
          </View>

          {/* §3.3 — Name */}
          <View className="mb-5">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              TÊN DỊCH VỤ *
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
              <TextInput className="py-3.5 text-base font-semibold text-slate-900" placeholder="VD: Giặt thường" placeholderTextColor={Colors.slate300} value={name} onChangeText={setName} autoFocus={!isEdit}/>
            </View>
          </View>

          {/* Category */}
          <View className="mb-5">
            <Text className="mb-2 text-slate-500" style={labelStyle}>
              DANH MỤC *
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
              <TextInput className="py-3.5 text-base font-semibold text-slate-900" placeholder="VD: Giặt sấy" placeholderTextColor={Colors.slate300} value={category} onChangeText={setCategory}/>
            </View>
          </View>

          {/* Price + Unit in row */}
          <View className="mb-5 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                GIÁ (VND) *
              </Text>
              <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
                <TextInput className="py-3.5 text-base font-semibold text-slate-900" placeholder="15000" placeholderTextColor={Colors.slate300} keyboardType="numeric" value={price} onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}/>
              </View>
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                ĐƠN VỊ *
              </Text>
              <View className="rounded-xl border border-slate-200 bg-slate-50 px-3">
                <TextInput className="py-3.5 text-base font-semibold text-slate-900" placeholder="kg" placeholderTextColor={Colors.slate300} value={unit} onChangeText={setUnit}/>
              </View>
            </View>
          </View>

          {/* Active toggle */}
          <View className="mb-8 flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Text className="text-sm font-bold text-slate-700">
              Hoạt động
            </Text>
            <Switch value={active} onValueChange={setActive} trackColor={{ false: Colors.slate200, true: Colors.indigo500 }} thumbColor="#fff"/>
          </View>

          {/* Submit */}
          <Pressable onPress={handleSubmit} disabled={isLoading || !isValid} className="flex-row items-center justify-center rounded-xl bg-indigo-600 py-4" style={({ pressed }) => [
            shadowCTA,
            pressedStyle(pressed),
            { opacity: isLoading || !isValid ? 0.5 : 1 },
        ]}>
            {isLoading ? (<ActivityIndicator color="#fff"/>) : (<>
                <FloppyDisk size={20} color="#fff" weight="bold"/>
                <Text className="ml-2 text-base font-bold text-white">
                  {isEdit ? 'Cập nhật' : 'Tạo dịch vụ'}
                </Text>
              </>)}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>);
}

