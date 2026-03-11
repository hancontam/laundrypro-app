// src/features/contact/screens/ContactRequestListScreen.tsx
import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable, // Assuming we'll need this for navigation later maybe
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ChatCircleText,
  User,
  EnvelopeSimple,
  TextT,
} from "phosphor-react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchContactsThunk, loadMoreContactsThunk } from "../contactSlice";
import type { Contact } from "../types";
import { MainStackParamList } from "@/app/navigation"; // Assuming this gets updated in navigation.tsx
import {
  Colors,
  shadowCard,
  shadowFloating,
  pressedStyleSmall,
  layoutContainer,
} from "@/theme/tokens";

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, any>; // Relaxed typing until navigation is updated
};

// ─── Format helper ───────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Contact Request Card ────────────────────────────────────────
function ContactRequestCard({ request }: { request: Contact }) {
  const isRead = request.status === "read" || request.status === "replied";

  return (
    <View
      className="mb-4 rounded-2xl border border-slate-100 bg-white p-5"
      style={shadowCard}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-bold text-slate-400">
          #{request._id.slice(-8).toUpperCase()}
        </Text>
        <View
          className={`rounded-lg px-2.5 py-1 ${
            isRead ? "bg-slate-100" : "bg-indigo-50"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              isRead ? "text-slate-500" : "text-indigo-600"
            }`}
          >
            {request.status === "new"
              ? "Mới"
              : request.status === "read"
                ? "Đã xem"
                : "Đã phản hồi"}
          </Text>
        </View>
      </View>

      <View className="mb-2 flex-row items-center">
        <User size={16} color={Colors.slate400} weight="bold" />
        <Text className="ml-2 text-base font-bold text-slate-900">
          {request.name}
        </Text>
      </View>

      <View className="mb-4 flex-row items-center border-b border-slate-100 pb-3">
        <EnvelopeSimple size={16} color={Colors.slate400} weight="bold" />
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

      <View className="flex-row items-center justify-end pt-1">
        <Text className="text-xs font-medium text-slate-400">
          {formatDate(request.createdAt)}
        </Text>
      </View>
    </View>
  );
}

// ─── Empty state ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <ChatCircleText size={32} color={Colors.indigo600} weight="bold" />
      </View>
      <Text className="text-lg font-extrabold text-slate-900">
        Chưa có liên hệ
      </Text>
      <Text className="mt-2 text-sm font-medium text-slate-500">
        Hiện tại không có yêu cầu liên hệ nào.
      </Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function ContactRequestListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { list, pagination, isLoading, isLoadingMore, error } = useAppSelector(
    (state) => state.contact,
  );

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

  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-page items-center justify-center">
        <Text className="text-slate-500 font-medium">
          Bạn không có quyền truy cập trang này.
        </Text>
      </SafeAreaView>
    );
  }

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 mt-2">
        <ActivityIndicator color={Colors.indigo600} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-page" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white"
          style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
        >
          <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
        </Pressable>
        <Text className="text-2xl font-extrabold text-slate-900">
          Yêu cầu liên hệ
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View className="mx-6 my-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={list}
        renderItem={({ item }) => <ContactRequestCard request={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[layoutContainer, { paddingHorizontal: 24 }]}
        contentContainerClassName="pb-12 pt-4"
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !isLoadingMore}
            onRefresh={handleRefresh}
            colors={[Colors.indigo600]}
            tintColor={Colors.indigo600}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}
