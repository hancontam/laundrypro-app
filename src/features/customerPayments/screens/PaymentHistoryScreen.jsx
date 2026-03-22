import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, FlatList, ActivityIndicator, Text, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "phosphor-react-native";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchPaymentHistoryThunk, setSelectedPayment, updatePaymentStatusThunk, } from "../customerPaymentsSlice";
import PaymentHistoryItem from "../components/PaymentHistoryItem";
import { Colors, shadowCard, shadowFloating, pressedStyleSmall } from "@/theme/tokens";
import { PAYMENT_STATUS_ACTION_LABEL } from "@/features/payments/paymentMeta";
import ListSearchBar from "@/components/ListSearchBar";
import FilterChips from "@/components/FilterChips";
export default function PaymentHistoryScreen({ navigation, route }) {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { paymentHistory, loading, updatingPaymentId, error } = useAppSelector((state) => state.customerPayments);
    const isStaffOrAdmin = user?.role === "admin" || user?.role === "staff";
    const paymentScope = route.params?.scope === "all" ? "all" : "my";
    const canManagePayments = isStaffOrAdmin && paymentScope === "all";
    const showBackButton = navigation.canGoBack();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    useEffect(() => {
        dispatch(fetchPaymentHistoryThunk(paymentScope));
    }, [dispatch, paymentScope]);
    const statusOptions = useMemo(() => [
        { label: "Tất cả", value: "all" },
        { label: "Chờ thanh toán", value: "pending" },
        { label: "Đã thanh toán", value: "paid" },
        { label: "Thất bại", value: "failed" },
        { label: "Hoàn tiền", value: "refunded" },
    ], []);
    const filteredPayments = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();
        return paymentHistory.filter((payment) => {
            if (statusFilter !== "all" && payment.status !== statusFilter) {
                return false;
            }
            if (!normalizedSearch) {
                return true;
            }
            const haystack = [
                payment.orderCode,
                payment.orderId,
                payment.customerName,
                payment.customerPhone,
                payment.method,
                payment.status,
                payment.transactionRef,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(normalizedSearch);
        });
    }, [paymentHistory, searchQuery, statusFilter]);
    const handlePressPayment = (payment) => {
        dispatch(setSelectedPayment(payment));
        navigation.navigate("PaymentDetail");
    };
    const handleStatusChange = useCallback((payment, status) => {
        Alert.alert("Cập nhật trạng thái", `Bạn muốn chuyển giao dịch này sang "${PAYMENT_STATUS_ACTION_LABEL[status]}"?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xác nhận",
                onPress: async () => {
                    const result = await dispatch(updatePaymentStatusThunk({ paymentId: payment._id, status }));
                    if (updatePaymentStatusThunk.rejected.match(result)) {
                        Alert.alert("Không thể cập nhật", result.payload || "Cập nhật trạng thái thất bại.");
                    }
                },
            },
        ]);
    }, [dispatch]);
    const title = canManagePayments ? "Lịch sử thanh toán toàn hệ thống" : "Lịch sử thanh toán";
    const summaryTitle = showBackButton
        ? canManagePayments
            ? "Toàn hệ thống"
            : "Giao dịch của bạn"
        : title;
    return (<SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <View className="flex-1 px-4 pt-4">
        {showBackButton ? (<View className="mb-4 flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="h-10 w-10 items-center justify-center rounded-xl bg-white" style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}>
              <ArrowLeft size={20} color={Colors.slate700} weight="bold"/>
            </Pressable>
            <Text className="ml-3 text-xl font-extrabold text-slate-900">{title}</Text>
          </View>) : null}

        {loading && paymentHistory.length === 0 ? (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.indigo600}/>
          </View>) : error && paymentHistory.length === 0 ? (<View className="flex-1 items-center justify-center p-6">
            <Text className="text-center text-red-500">{error}</Text>
          </View>) : (<>
      <View className="mb-4 rounded-2xl border border-slate-100 bg-white px-5 py-4" style={shadowCard}>
        <Text className="text-lg font-extrabold text-slate-900">
          {summaryTitle}
        </Text>
        <Text className="mt-1 text-sm font-medium leading-6 text-slate-500">
          {canManagePayments
              ? "Xem tất cả giao dịch của khách hàng trong hệ thống."
              : "Theo dõi các giao dịch thanh toán của bạn."}
        </Text>
      </View>

      <View className="mb-4">
        <ListSearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Tìm theo mã đơn, khách hàng hoặc số điện thoại..."/>
        <View className="mt-3">
          <FilterChips options={statusOptions} value={statusFilter} onChange={setStatusFilter}/>
        </View>
      </View>

      {error && (<View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>)}

      <FlatList data={filteredPayments} keyExtractor={(item) => item._id} renderItem={({ item }) => (<PaymentHistoryItem payment={item} onPress={handlePressPayment} showStatusActions={canManagePayments} isUpdating={updatingPaymentId === item._id} onStatusChange={handleStatusChange} canRefund={user?.role === "admin"}/>)} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }} ListEmptyComponent={!loading ? (<View className="mt-12 items-center justify-center">
              <Text className="text-slate-500">
                {searchQuery.trim() || statusFilter !== "all"
                ? "Không có giao dịch phù hợp với bộ lọc hiện tại"
                : canManagePayments
                    ? "Chưa có giao dịch thanh toán nào trong hệ thống"
              : "Bạn chưa có lịch sử thanh toán nào"}
              </Text>
            </View>) : null} refreshing={loading} onRefresh={() => dispatch(fetchPaymentHistoryThunk(paymentScope))}/>
        </>)}
      </View>
    </SafeAreaView>);
}
