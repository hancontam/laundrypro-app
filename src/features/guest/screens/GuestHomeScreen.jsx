import React, { useEffect, useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, Image, useWindowDimensions, } from "react-native";
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
function GuestServiceCard({ service, cardWidth, compact, }) {
    const [imageFailed, setImageFailed] = useState(false);
    useEffect(() => {
        setImageFailed(false);
    }, [service.image]);
    return (<View className="mb-4 overflow-hidden rounded-[26px] border border-slate-100 bg-white" style={[shadowCard, { width: cardWidth }]}>
      <View className="relative">
        {service.image && !imageFailed ? (<Image source={{ uri: service.image }} className={`${compact ? "h-36" : "h-44"} w-full bg-slate-100`} resizeMode="cover" onError={() => setImageFailed(true)}/>) : (<View className={`${compact ? "h-36" : "h-44"} w-full items-center justify-center bg-indigo-50`}>
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/80">
              <Broom size={30} color={Colors.indigo600} weight="bold"/>
            </View>
          </View>)}

        <View className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5">
          <View className="flex-row items-center gap-1.5">
            <Tag size={12} color={Colors.slate500} weight="bold"/>
            <Text className="text-[11px] font-bold text-slate-600">
              {service.category || "Dịch vụ"}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className={`${compact ? "text-[15px]" : "text-base"} font-extrabold text-slate-900`} numberOfLines={2}>
          {service.name}
        </Text>
        <Text className="mt-1 text-xs font-medium text-slate-400" numberOfLines={1}>
          Tính theo /{service.unit || "món"}
        </Text>

        <View className="mt-4">
          <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-400">
            {compact ? "Giá" : "Giá dịch vụ"}
          </Text>
          <Text className={`${compact ? "text-[18px]" : "text-xl"} mt-1 font-extrabold text-slate-900`} numberOfLines={1}>
            {formatPrice(service.price)}
          </Text>
        </View>
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
    const { width } = useWindowDimensions();
    useEffect(() => {
        dispatch(fetchServicesThunk(undefined));
    }, [dispatch]);
    const handleRefresh = useCallback(() => {
        dispatch(fetchServicesThunk(undefined));
    }, [dispatch]);
    const horizontalPadding = 48;
    const columnGap = 12;
    const contentWidth = Math.min(width, layoutContainer.maxWidth) - horizontalPadding;
    const numColumns = contentWidth >= 420 ? 2 : 1;
    const cardWidth = numColumns === 2
        ? Math.floor((contentWidth - columnGap) / 2)
        : Math.max(contentWidth, 0);
    const compactCard = numColumns === 2 && cardWidth < 220;
    const renderHeader = () => (<View className="mb-8 mt-2">
      {/* Welcome Banner */}
      <View className="mb-6 w-full rounded-2xl border border-slate-100 bg-white p-6" style={shadowCard}>
        <View className="mb-4 items-center">
          <Image source={require("../../../../assets/visual/2.png")} className="mb-4 h-28 w-28" resizeMode="contain"/>
          <Text className="text-2xl font-extrabold text-slate-900">
            LaundryPro
          </Text>
          <Text className="mt-2 text-sm font-medium text-slate-500 text-center">
            Dịch vụ giặt ủi chuyên nghiệp, tận tâm và giao nhận tận nơi.
          </Text>
        </View>

        <View className="w-full gap-3 mt-2">
          {/* Login Button */}
          <Pressable onPress={() => navigation.navigate("Login")} className="flex-row items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4" style={({ pressed }) => [shadowCTA, pressedStyle(pressed)]}>
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
      <FlatList data={list} renderItem={({ item }) => (<GuestServiceCard service={item} cardWidth={cardWidth} compact={compactCard}/>)} keyExtractor={(item) => item._id} numColumns={numColumns} key={numColumns} columnWrapperStyle={numColumns > 1 ? { justifyContent: "space-between" } : undefined} contentContainerStyle={[layoutContainer, { paddingHorizontal: 24 }]} contentContainerClassName="pb-12 pt-4" ListHeaderComponent={renderHeader} ListEmptyComponent={!isLoading ? <EmptyState /> : null} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[Colors.indigo600]} tintColor={Colors.indigo600}/>}/>
    </SafeAreaView>);
}
