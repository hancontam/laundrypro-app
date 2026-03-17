import React, { useCallback, useEffect } from "react";
import { View, FlatList, ActivityIndicator, Text, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchPaymentHistoryThunk,
  setSelectedPayment,
  updatePaymentStatusThunk,
} from "../customerPaymentsSlice";
import PaymentHistoryItem from "../components/PaymentHistoryItem";
import { Colors, shadowCard } from "@/theme/tokens";
import type { Payment, PaymentStatus } from "../types";

type RootStackParamList = {
  PaymentHistory: undefined;
  PaymentDetail: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "PaymentHistory">;

export default function PaymentHistoryScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user);
  const { paymentHistory, loading, updatingPaymentId, error } = useAppSelector(
    (state: any) => state.customerPayments,
  );
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    dispatch(fetchPaymentHistoryThunk(isAdmin ? "all" : "my"));
  }, [dispatch, isAdmin]);

  const handlePressPayment = (payment: Payment) => {
    dispatch(setSelectedPayment(payment));
    navigation.navigate("PaymentDetail");
  };

  const handleStatusChange = useCallback(
    (payment: Payment, status: PaymentStatus) => {
      const statusLabel: Record<PaymentStatus, string> = {
        pending: "Chờ xử lý",
        paid: "Đã thanh toán",
        failed: "Thất bại",
        refunded: "Hoàn tiền",
      };

      Alert.alert(
        "Cập nhật trạng thái",
        `Bạn muốn chuyển giao dịch này sang "${statusLabel[status]}"?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xác nhận",
            onPress: async () => {
              const result = await dispatch(
                updatePaymentStatusThunk({ paymentId: payment._id, status }),
              );

              if (updatePaymentStatusThunk.rejected.match(result)) {
                Alert.alert(
                  "Không thể cập nhật",
                  (result.payload as string) || "Cập nhật trạng thái thất bại.",
                );
              }
            },
          },
        ],
      );
    },
    [dispatch],
  );

  if (loading && paymentHistory.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={Colors.indigo600} />
      </View>
    );
  }

  if (error && paymentHistory.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-center text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-4">
      <View
        className="mb-4 rounded-2xl border border-slate-100 bg-white px-5 py-4"
        style={shadowCard}
      >
        <Text className="text-lg font-extrabold text-slate-900">
          {isAdmin ? "Lịch sử thanh toán toàn hệ thống" : "Lịch sử thanh toán"}
        </Text>
        <Text className="mt-1 text-sm font-medium leading-6 text-slate-500">
          {isAdmin
            ? "Xem tất cả giao dịch của khách hàng trong hệ thống."
            : "Theo dõi các giao dịch thanh toán của bạn."}
        </Text>
      </View>

      {error && (
        <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>
      )}

      <FlatList
        data={paymentHistory}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PaymentHistoryItem
            payment={item}
            onPress={handlePressPayment}
            showStatusActions={isAdmin}
            isUpdating={updatingPaymentId === item._id}
            onStatusChange={handleStatusChange}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-12 items-center justify-center">
              <Text className="text-slate-500">
                {isAdmin
                  ? "Chưa có giao dịch thanh toán nào trong hệ thống"
                  : "Bạn chưa có lịch sử thanh toán nào"}
              </Text>
            </View>
          ) : null
        }
        refreshing={loading}
        onRefresh={() => dispatch(fetchPaymentHistoryThunk(isAdmin ? "all" : "my"))}
      />
    </View>
  );
}
