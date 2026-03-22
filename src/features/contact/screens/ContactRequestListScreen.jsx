import React, { useEffect, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChatCircleText, User, EnvelopeSimple, } from "phosphor-react-native";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchContactsThunk, loadMoreContactsThunk, updateContactStatusThunk } from "../contactSlice";
import { Colors, shadowCard, shadowFloating, pressedStyleSmall, layoutContainer, } from "@/theme/tokens";
// ─── Format helper ───────────────────────────────────────────────
function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
const CONTACT_STATUS_META = {
    new: {
        label: "Mới",
        bg: "bg-indigo-50",
        text: "text-indigo-600",
    },
    read: {
        label: "Đã xem",
        bg: "bg-slate-100",
        text: "text-slate-500",
    },
    replied: {
        label: "Đã phản hồi",
        bg: "bg-green-50",
        text: "text-green-700",
    },
};
const CONTACT_STATUS_OPTIONS = ["new", "read", "replied"];
// ─── Contact Request Card ────────────────────────────────────────
function ContactRequestCard({ request, isUpdating = false, onStatusChange }) {
    const statusMeta = CONTACT_STATUS_META[request.status] || CONTACT_STATUS_META.new;
    return (<View className="mb-4 rounded-2xl border border-slate-100 bg-white p-5" style={shadowCard}>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-bold text-slate-400">
          #{request._id.slice(-8).toUpperCase()}
        </Text>
        <View className={`rounded-lg px-2.5 py-1 ${statusMeta.bg}`}>
          <Text className={`text-xs font-bold ${statusMeta.text}`}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      <View className="mb-2 flex-row items-center">
        <User size={16} color={Colors.slate400} weight="bold"/>
        <Text className="ml-2 text-base font-bold text-slate-900">
          {request.name}
        </Text>
      </View>

      <View className="mb-4 flex-row items-center border-b border-slate-100 pb-3">
        <EnvelopeSimple size={16} color={Colors.slate400} weight="bold"/>
        <Text className="ml-2 text-sm font-medium text-slate-500">
          {request.email}
        </Text>
      </View>

      <View className="mb-2">
        <Text className="text-sm font-semibold text-slate-900">
          {request.subject || "Không có chủ đề"}
        </Text>
      </View>

      <View className="mb-4 rounded-xl bg-slate-50 p-3">
        <Text className="text-sm leading-relaxed text-slate-600">
          {request.message}
        </Text>
      </View>

      <View className="mb-4 border-t border-slate-100 pt-4">
        <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-slate-400">
          Cập nhật trạng thái
        </Text>
        {isUpdating ? (<View className="flex-row items-center">
            <ActivityIndicator size="small" color={Colors.indigo600}/>
            <Text className="ml-2 text-xs font-medium text-slate-500">
              Đang cập nhật...
            </Text>
          </View>) : (<View className="flex-row flex-wrap gap-2">
            {CONTACT_STATUS_OPTIONS.map((status) => {
            const optionMeta = CONTACT_STATUS_META[status] || CONTACT_STATUS_META.new;
            const isActive = request.status === status;
            return (<Pressable key={status} onPress={() => onStatusChange?.(request, status)} disabled={isActive} className={`rounded-full border px-3 py-2 ${isActive
                    ? `${optionMeta.bg} border-transparent`
                    : "border-slate-200 bg-white"}`} style={({ pressed }) => pressedStyleSmall(pressed)}>
                  <Text className={`text-xs font-bold ${isActive ? optionMeta.text : "text-slate-700"}`}>
                    {optionMeta.label}
                  </Text>
                </Pressable>);
        })}
          </View>)}
      </View>

      <View className="flex-row items-center justify-end pt-1">
        <Text className="text-xs font-medium text-slate-400">
          {formatDate(request.createdAt)}
        </Text>
      </View>
    </View>);
}
// ─── Empty state ─────────────────────────────────────────────────
function EmptyState() {
    return (<View className="flex-1 items-center justify-center py-20">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <ChatCircleText size={32} color={Colors.indigo600} weight="bold"/>
      </View>
      <Text className="text-lg font-extrabold text-slate-900">
        Chưa có liên hệ
      </Text>
      <Text className="mt-2 text-sm font-medium text-slate-500">
        Hiện tại không có yêu cầu liên hệ nào.
      </Text>
    </View>);
}
// ─── Main Screen ─────────────────────────────────────────────────
export default function ContactRequestListScreen({ navigation }) {
    const dispatch = useAppDispatch();
    const { list, pagination, isLoading, isLoadingMore, updatingContactId, error } = useAppSelector((state) => state.contact);
    // Protect route just in case
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "admin";
    useEffect(() => {
        if (isAdmin) {
            dispatch(fetchContactsThunk({ page: 1 }));
        }
    }, [dispatch, isAdmin]);
    const handleRefresh = useCallback(() => {
        dispatch(fetchContactsThunk({ page: 1 }));
    }, [dispatch]);
    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && pagination.page < pagination.totalPages) {
            dispatch(loadMoreContactsThunk());
        }
    }, [dispatch, isLoadingMore, pagination]);
    const handleStatusChange = useCallback((request, status) => {
        if (request.status === status) {
            return;
        }
        const nextLabel = CONTACT_STATUS_META[status]?.label || status;
        Alert.alert("Cập nhật trạng thái", `Bạn muốn chuyển liên hệ này sang "${nextLabel}"?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xác nhận",
                onPress: async () => {
                    const result = await dispatch(updateContactStatusThunk({
                        contactId: request._id,
                        status,
                    }));
                    if (updateContactStatusThunk.rejected.match(result)) {
                        Alert.alert("Không thể cập nhật", result.payload || "Cập nhật trạng thái liên hệ thất bại.");
                    }
                },
            },
        ]);
    }, [dispatch]);
    if (!isAdmin) {
        return (<SafeAreaView className="flex-1 bg-page items-center justify-center">
        <Text className="text-slate-500 font-medium">
          Bạn không có quyền truy cập trang này.
        </Text>
      </SafeAreaView>);
    }
    const renderFooter = () => {
        if (!isLoadingMore)
            return null;
        return (<View className="py-4 mt-2">
        <ActivityIndicator color={Colors.indigo600}/>
      </View>);
    };
    return (<SafeAreaView className="flex-1 bg-page" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => navigation.goBack()} className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white" style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}>
          <ArrowLeft size={20} color={Colors.slate700} weight="bold"/>
        </Pressable>
        <Text className="text-2xl font-extrabold text-slate-900">
          Yêu cầu liên hệ
        </Text>
      </View>

      {/* Error */}
      {error && (<View className="mx-6 my-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>)}

      {/* List */}
      <FlatList data={list} renderItem={({ item }) => (<ContactRequestCard request={item} isUpdating={updatingContactId === item._id} onStatusChange={handleStatusChange}/>)} keyExtractor={(item) => item._id} contentContainerStyle={[layoutContainer, { paddingHorizontal: 24 }]} contentContainerClassName="pb-12 pt-4" ListEmptyComponent={!isLoading ? <EmptyState /> : null} refreshControl={<RefreshControl refreshing={isLoading && !isLoadingMore} onRefresh={handleRefresh} colors={[Colors.indigo600]} tintColor={Colors.indigo600}/>} onEndReached={handleLoadMore} onEndReachedThreshold={0.3} ListFooterComponent={renderFooter}/>
    </SafeAreaView>);
}
