import React, { useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, Image, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Broom, Tag, SignIn, ChatCircleText, } from "phosphor-react-native";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchServicesThunk } from "@/features/services/servicesSlice";
import { Colors, shadowCard, shadowOutline, shadowCTA, pressedStyle, pressedStyleSmall, layoutContainer, } from "@/theme/tokens";
// ─── Format helpers ──────────────────────────────────────────────
function formatPrice(amount) {
    return amount.toLocaleString("vi-VN") + "đ";
}
// ─── Service card ────────────────────────────────────────────────
function GuestServiceCard({ service }) {
    // Read-only card for guests. No onPress.
    return (<View className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4" style={shadowCard}>
      {/* Image / Fallback Icon */}
      {service.image ? (<Image source={{ uri: service.image }} className="mr-3 h-12 w-12 rounded-full bg-slate-100" resizeMode="cover"/>) : (<View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
          <Broom size={24} color={Colors.indigo600} weight="bold"/>
        </View>)}

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">
          {service.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <Tag size={14} color={Colors.slate400} weight="bold"/>
          <Text className="text-xs font-medium text-slate-500">
            {service.category}
          </Text>
        </View>
      </View>

      {/* Price */}
      <View className="items-end">
        <Text className="text-sm font-extrabold text-indigo-600">
          {formatPrice(service.price)}
        </Text>
        <Text className="text-xs font-medium text-slate-400">
          /{service.unit}
        </Text>
      </View>
    </View>);
}
// ─── Empty state ─────────────────────────────────────────────────
function EmptyState() {
    return (<View className="flex-1 items-center justify-center py-10">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <Broom size={32} color={Colors.indigo600} weight="bold"/>
      </View>
      <Text className="text-lg font-extrabold text-slate-900">
        Chưa có dịch vụ
      </Text>
      <Text className="mt-2 text-sm font-medium text-slate-500">
        Danh sách dịch vụ sẽ được cập nhật sớm.
      </Text>
    </View>);
}
export default function GuestHomeScreen({ navigation }) {
    const dispatch = useAppDispatch();
    const { list, isLoading, error } = useAppSelector((s) => s.services);
    useEffect(() => {
        dispatch(fetchServicesThunk(undefined));
    }, [dispatch]);
    const handleRefresh = useCallback(() => {
        dispatch(fetchServicesThunk(undefined));
    }, [dispatch]);
    const renderHeader = () => (<View className="mb-8 mt-2">
      {/* Welcome Banner */}
      <View className="mb-6 w-full rounded-2xl border border-slate-100 bg-white p-6" style={shadowCard}>
        <View className="mb-4 items-center">
          <Text className="text-2xl font-extrabold">
            <Text style={{ color: Colors.primary }}>Laundry</Text>
            <Text style={{ color: Colors.textPrimary }}>Pro</Text>
          </Text>
          <Text className="mt-2 text-sm font-medium text-slate-500 text-center">
            Dịch vụ giặt ủi chuyên nghiệp, tận tâm và giao nhận tận nơi.
          </Text>
        </View>

        <View className="w-full gap-3 mt-2">
          {/* Login Button */}
          <Pressable onPress={() => navigation.navigate("Login")} className="flex-row items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4" style={({ pressed }) => [shadowCTA, pressedStyle(pressed)]}>
            <SignIn size={20} color="#fff" weight="bold"/>
            <Text className="text-base font-bold text-white">Đăng nhập</Text>
          </Pressable>

          {/* Contact Button */}
          <Pressable onPress={() => navigation.navigate("ContactUs")} className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5" style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}>
            <ChatCircleText size={20} color={Colors.slate700} weight="bold"/>
            <Text className="text-sm font-bold text-slate-700">
              Liên hệ hỗ trợ
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Services Title */}
      <Text className="text-xl font-extrabold text-slate-900">
        Bảng giá dịch vụ
      </Text>
      <Text className="mt-1 mb-2 text-sm font-medium text-slate-500">
        Tham khảo các dịch vụ giặt ủi của chúng tôi
      </Text>

      {/* Error */}
      {error && (<View className="mb-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>)}
    </View>);
    return (<SafeAreaView className="flex-1 bg-page">
      <FlatList data={list} renderItem={({ item }) => <GuestServiceCard service={item}/>} keyExtractor={(item) => item._id} contentContainerStyle={[layoutContainer, { paddingHorizontal: 24 }]} contentContainerClassName="pb-12 pt-4" ListHeaderComponent={renderHeader} ListEmptyComponent={!isLoading ? <EmptyState /> : null} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[Colors.indigo600]} tintColor={Colors.indigo600}/>}/>
    </SafeAreaView>);
}

