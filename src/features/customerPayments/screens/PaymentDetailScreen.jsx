import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { CreditCard, Receipt, Calendar, Code, ArrowLeft, } from "phosphor-react-native";
import { Colors, shadowCard, pressedStyleSmall } from "@/theme/tokens";
import { useAppDispatch, useAppSelector } from "@/app/store";
import PaymentStatusBadge from "../components/PaymentStatusBadge";
import { SafeAreaView } from "react-native-safe-area-context";
import { PAYMENT_METHOD_LABEL, PAYMENT_STATUS_ACTION_LABEL, getPaymentNextStatuses } from "@/features/payments/paymentMeta";
import { updatePaymentStatusThunk } from "../customerPaymentsSlice";
import { updateOrderStatusThunk } from "@/features/orders/ordersSlice";
function formatPrice(amount) {
  return amount.toLocaleString("vi-VN") + "đ";
}
function formatDate(iso) {
  if (!iso)
    return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export default function PaymentDetailScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const { selectedPayment, updatingPaymentId } = useAppSelector((state) => state.customerPayments);
  const user = useAppSelector((state) => state.auth.user);
  if (!selectedPayment) {
    return (<View className="flex-1 items-center justify-center bg-slate-50 p-4">
      <Text className="text-slate-500">
        Không tìm thấy thông tin thanh toán
      </Text>
    </View>);
  }
  const { amount, method, status, createdAt, transactionRef, orderId, paidAt } = selectedPayment;
  const isAdmin = user?.role === "admin";
  const canManagePayments = user?.role === "admin" || user?.role === "staff";
  const nextStatuses = getPaymentNextStatuses(status, { canRefund: isAdmin }).filter((nextStatus) => nextStatus !== "failed");
  const isUpdating = updatingPaymentId === selectedPayment._id;
  const customerLabel = selectedPayment.customerName ||
    selectedPayment.customerPhone ||
    (selectedPayment.customerId
      ? `#${selectedPayment.customerId.slice(-6).toUpperCase()}`
      : null);
  const handleStatusChange = useCallback((nextStatus) => {
    Alert.alert("Cập nhật thanh toán", `Bạn muốn chuyển thanh toán này sang "${PAYMENT_STATUS_ACTION_LABEL[nextStatus]}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        onPress: async () => {
          const result = await dispatch(updatePaymentStatusThunk({
            paymentId: selectedPayment._id,
            status: nextStatus,
          }));
          if (updatePaymentStatusThunk.rejected.match(result)) {
            Alert.alert("Không thể cập nhật", result.payload || "Cập nhật trạng thái thanh toán thất bại.");
            return;
          }
          if (nextStatus === "paid") {
            const completeResult = await dispatch(updateOrderStatusThunk({
              id: selectedPayment.orderId,
              status: "completed",
            }));
            if (updateOrderStatusThunk.rejected.match(completeResult)) {
              Alert.alert("Không thể cập nhật", completeResult.payload || "Thanh toán đã thành công nhưng không thể chuyển đơn hàng sang hoàn thành.");
            }
          }
        },
      },
    ]);
  }, [dispatch, selectedPayment]);
  return (<SafeAreaView className="flex-1 bg-slate-50">
    <View className="flex-row items-center border-b border-slate-200 bg-white px-4 py-3">
      <Pressable onPress={() => navigation.goBack()} className="mr-4 p-2">
        <ArrowLeft size={24} color={Colors.slate900} />
      </Pressable>
      <Text className="text-lg font-bold text-slate-900">
        Chi tiết thanh toán
      </Text>
    </View>

    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View className="mb-6 items-center">
        <Text className="text-sm font-medium text-slate-500">Số tiền</Text>
        <Text className="mt-1 text-3xl font-extrabold text-indigo-600">
          {formatPrice(amount)}
        </Text>
        <View className="mt-3">
          <PaymentStatusBadge status={status} />
        </View>
      </View>

      <View className="rounded-2xl border border-slate-100 bg-white p-5" style={shadowCard}>
        <Text className="mb-4 text-base font-bold text-slate-900">
          Thông tin chi tiết
        </Text>

        <View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
          <View className="flex-row items-center">
            <Receipt size={20} color={Colors.slate400} />
            <Text className="ml-2 text-sm font-medium text-slate-600">
              Mã đơn hàng
            </Text>
          </View>
          <Text className="text-sm font-bold text-slate-900">
            #{selectedPayment.orderCode || orderId.slice(-8).toUpperCase()}
          </Text>
        </View>

        {customerLabel && (<View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
          <View className="flex-row items-center">
            <Receipt size={20} color={Colors.slate400} />
            <Text className="ml-2 text-sm font-medium text-slate-600">
              Khách hàng
            </Text>
          </View>
          <Text className="text-sm font-bold text-slate-900">
            {customerLabel}
          </Text>
        </View>)}

        <View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
          <View className="flex-row items-center">
            <CreditCard size={20} color={Colors.slate400} />
            <Text className="ml-2 text-sm font-medium text-slate-600">
              Phương thức
            </Text>
          </View>
          <Text className="text-sm font-bold text-slate-900">
            {PAYMENT_METHOD_LABEL[method] || method}
          </Text>
        </View>

        <View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
          <View className="flex-row items-center">
            <Calendar size={20} color={Colors.slate400} />
            <Text className="ml-2 text-sm font-medium text-slate-600">
              Ngày tạo
            </Text>
          </View>
          <Text className="text-sm font-bold text-slate-900">
            {formatDate(createdAt)}
          </Text>
        </View>

        {status === "paid" && (<View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
          <View className="flex-row items-center">
            <Calendar size={20} color={Colors.slate400} />
            <Text className="ml-2 text-sm font-medium text-slate-600">
              Ngày thanh toán
            </Text>
          </View>
          <Text className="text-sm font-bold text-slate-900">
            {formatDate(paidAt)}
          </Text>
        </View>)}

        {transactionRef && (<View className="flex-row justify-between">
          <View className="flex-row items-center">
            <Code size={20} color={Colors.slate400} />
            <Text className="ml-2 text-sm font-medium text-slate-600">
              Mã giao dịch
            </Text>
          </View>
          <Text className="text-sm font-bold text-slate-900">
            {transactionRef}
          </Text>
        </View>)}
      </View>

      {canManagePayments && nextStatuses.length > 0 ? (<View>
        {nextStatuses.includes("paid") ? (<Pressable onPress={() => handleStatusChange("paid")} className="mb-4 flex-row items-center justify-center rounded-xl bg-indigo-600 py-4 mt-5" style={({ pressed }) => [
          pressedStyleSmall(pressed),
          { opacity: isUpdating ? 0.6 : 1 },
        ]} disabled={isUpdating}>
          {isUpdating ? (<ActivityIndicator size="small" color="#fff" />) : (<Text className="text-sm font-bold text-white">Thanh toán</Text>)}
        </Pressable>) : null}

        {nextStatuses.includes("pending") ? (<Pressable onPress={() => handleStatusChange("pending")} className="mb-4 flex-row items-center justify-center rounded-xl border border-slate-200 bg-white py-4 mt-5" style={({ pressed }) => [
          pressedStyleSmall(pressed),
          { opacity: isUpdating ? 0.6 : 1 },
        ]} disabled={isUpdating}>
          {isUpdating ? (<ActivityIndicator size="small" color={Colors.slate700} />) : (<Text className="text-sm font-bold text-slate-700">Chờ thanh toán</Text>)}
        </Pressable>) : null}

        {nextStatuses.includes("refunded") ? (<Pressable onPress={() => handleStatusChange("refunded")} className="mb-4 flex-row items-center justify-center rounded-xl border border-slate-200 bg-white py-4 mt-5" style={({ pressed }) => [
          pressedStyleSmall(pressed),
          { opacity: isUpdating ? 0.6 : 1 },
        ]} disabled={isUpdating}>
          {isUpdating ? (<ActivityIndicator size="small" color={Colors.slate700} />) : (<Text className="text-sm font-bold text-slate-700">Hoàn tiền</Text>)}
        </Pressable>) : null}
      </View>) : null}

    </ScrollView>
  </SafeAreaView>);
}
