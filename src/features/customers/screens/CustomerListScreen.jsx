import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  ArrowLeft,
  User,
  Plus,
  CaretRight,
  ShieldStar,
} from "phosphor-react-native";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchCustomersThunk,
  loadMoreCustomersThunk,
  selectAllCustomers,
} from "../customersSlice";
import {
  Colors,
  shadowCard,
  shadowCTA,
  shadowFloating,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
} from "@/theme/tokens";
function CustomerCard({ customer, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-4"
      style={({ pressed }) => [shadowCard, pressedStyle(pressed)]}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
          <User size={24} color={Colors.indigo600} weight="fill" />
        </View>
        <View>
          <Text className="text-base font-bold text-slate-900">
            {customer.name || "Chưa cập nhật tên"}
          </Text>
          <Text className="mt-0.5 text-sm font-medium text-slate-500">
            {customer.phone}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-2">
            {customer.status === "active" ? (
              <View className="rounded bg-green-50 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-green-700">
                  HOẠT ĐỘNG
                </Text>
              </View>
            ) : (
              <View className="rounded bg-red-50 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-red-700">
                  ĐÃ KHÓA
                </Text>
              </View>
            )}
            {customer.isVerified && (
              <ShieldStar size={14} color="#22C55E" weight="fill" />
            )}
          </View>
        </View>
      </View>
      <CaretRight size={20} color={Colors.slate400} weight="bold" />
    </Pressable>
  );
}
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <User size={32} color={Colors.indigo600} weight="bold" />
      </View>
      <Text className="text-lg font-extrabold text-slate-900">
        Chưa có khách hàng
      </Text>
      <Text className="mt-2 text-sm font-medium text-slate-500">
        Danh sách khách hàng sẽ hiển thị ở đây
      </Text>
    </View>
  );
}
export default function CustomerListScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const customers = useAppSelector(selectAllCustomers);
  const { isLoading, isLoadingMore, pagination, error } = useAppSelector(
    (state) => state.customers,
  );
  const showBackButton = navigation.canGoBack();
  useEffect(() => {
    dispatch(fetchCustomersThunk(undefined));
  }, [dispatch]);
  const handleRefresh = useCallback(() => {
    dispatch(fetchCustomersThunk(undefined));
  }, [dispatch]);
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && pagination.page < pagination.totalPages) {
      dispatch(loadMoreCustomersThunk(undefined));
    }
  }, [dispatch, isLoadingMore, pagination]);
  const renderFooter = () => {
    if (!isLoadingMore) return <View className="h-4" />;
    return (
      <View className="py-4">
        <ActivityIndicator color={Colors.indigo600} />
      </View>
    );
  };
  return (
    <SafeAreaView className="flex-1 bg-page">
      <View className="flex-row items-center px-6 pb-2 pt-4">
        {showBackButton ? (
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white"
            style={({ pressed }) => [
              shadowFloating,
              pressedStyleSmall(pressed),
            ]}
          >
            <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
          </Pressable>
        ) : null}
        <Text className="text-2xl font-extrabold text-slate-900">
          Khách hàng
        </Text>
      </View>

      {error && (
        <View className="mx-6 mb-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>
      )}

      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() =>
              navigation.navigate("CustomerDetail", { customerId: item._id })
            }
          />
        )}
        contentContainerStyle={[layoutContainer, { paddingHorizontal: 24 }]}
        contentContainerClassName="pb-24 pt-2"
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

      <View
        style={{
          position: "absolute",
          right: 24,
          bottom: Math.max(insets.bottom + 32, 40),
        }}
      >
        <Pressable
          onPress={() => navigation.navigate("CustomerForm")}
          className="h-14 w-14 items-center justify-center rounded-full bg-indigo-600"
          style={({ pressed }) => [shadowCTA, pressedStyleSmall(pressed)]}
        >
          <Plus size={24} color="#fff" weight="bold" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

