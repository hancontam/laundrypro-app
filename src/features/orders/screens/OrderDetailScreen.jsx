import React, { useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, CreditCard, CheckCircle, Trash, } from "phosphor-react-native";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchOrderByIdThunk, updateOrderStatusThunk, clearSelectedOrder, clearOrderError, } from "../ordersSlice";
import { Colors, shadowCard, shadowFloating, pressedStyleSmall, layoutContainer, labelStyle, } from "@/theme/tokens";
import PaymentSummary from "../../payments/components/PaymentSummary";
import { updatePaymentStatusThunk } from "@/features/customerPayments/customerPaymentsSlice";
import { ORDER_STATUS_ACTION_LABEL, ORDER_STATUS_META } from "../orderMeta";
import { PAYMENT_STATUS_ACTION_LABEL, getPaymentNextStatuses } from "@/features/payments/paymentMeta";
// ─── Formatters ──────────────────────────────────────────────────
function formatPrice(amount) {
    return amount.toLocaleString("vi-VN") + "đ";
}
function formatDate(iso) {
    return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
// ─── Section card ────────────────────────────────────────────────
function SectionCard({ title, children, }) {
    return (<View className="mb-4 rounded-2xl border border-slate-100 bg-white p-4" style={shadowCard}>
      <Text className="mb-3 text-slate-400" style={labelStyle}>
        {title}
      </Text>
      {children}
    </View>);
}
// ─── Item row ────────────────────────────────────────────────────
function ItemRow({ item }) {
    return (<View className="flex-row items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
      <View className="flex-1">
        <Text className="text-sm font-bold text-slate-900">
          {item.serviceName}
        </Text>
        <Text className="mt-0.5 text-xs font-medium text-slate-400">
          {item.serviceCategory} · {item.quantity} {item.serviceUnit} ×{" "}
          {formatPrice(item.unitPrice)}
        </Text>
        {item.note ? (<Text className="mt-1 text-xs font-medium text-slate-400 italic">
            {item.note}
          </Text>) : null}
      </View>
      <Text className="text-sm font-extrabold text-slate-900">
        {formatPrice(item.totalPrice)}
      </Text>
      </View>);
}
function ActionButton({ label, icon: Icon, onPress, disabled = false, tone = "default" }) {
    const toneClassName = tone === "danger"
        ? "border-red-100 bg-red-50"
        : tone === "success"
            ? "border-green-100 bg-green-50"
            : "border-slate-200 bg-slate-50";
    const textClassName = tone === "danger"
        ? "text-red-700"
        : tone === "success"
            ? "text-green-700"
            : "text-slate-700";
    const iconColor = tone === "danger"
        ? Colors.red600
        : tone === "success"
            ? Colors.green600
            : Colors.slate700;
    return (<Pressable onPress={onPress} disabled={disabled} className={`flex-row items-center rounded-full border px-3 py-2 ${toneClassName}`} style={({ pressed }) => [
            pressedStyleSmall(pressed),
            { opacity: disabled ? 0.45 : 1 },
        ]}>
      {Icon ? <Icon size={15} color={iconColor} weight="bold"/> : null}
      <Text className={`text-xs font-bold ${Icon ? "ml-1.5" : ""} ${textClassName}`}>
        {label}
      </Text>
    </Pressable>);
}
// ─── Main screen ─────────────────────────────────────────────────
export default function OrderDetailScreen({ navigation, route }) {
    const { orderId } = route.params;
    const dispatch = useAppDispatch();
    const { selectedOrder, isLoading, error } = useAppSelector((s) => s.orders);
    const { updatingPaymentId } = useAppSelector((s) => s.customerPayments);
    const { user } = useAppSelector((s) => s.auth);
    const userRole = user?.role;
    const isAdmin = userRole === "admin";
    const isStaffOrAdmin = userRole === "staff" || userRole === "admin";
    useEffect(() => {
        dispatch(fetchOrderByIdThunk(orderId));
        return () => {
            dispatch(clearSelectedOrder());
        };
    }, [dispatch, orderId]);
    const orderStatusMeta = ORDER_STATUS_META[selectedOrder?.status] || ORDER_STATUS_META.pending;
    const nextPaymentStatuses = getPaymentNextStatuses(selectedOrder?.payment?.status, {
        canRefund: isAdmin,
    });
    const canCreatePayment = selectedOrder?.status === "pending" &&
        !selectedOrder?.payment &&
        isStaffOrAdmin;
    const canDeleteOrder = isStaffOrAdmin && selectedOrder?.status === "pending";
    const canCompleteOrder = isStaffOrAdmin &&
        selectedOrder?.status === "pending" &&
        selectedOrder?.payment?.status === "paid";
    const showOrderActions = isStaffOrAdmin && selectedOrder?.status !== "completed" && selectedOrder?.status !== "deleted";
    const showPaymentActions = isStaffOrAdmin &&
        selectedOrder?.payment &&
        selectedOrder?.status !== "deleted";
    const handleOrderStatusChange = useCallback((status) => {
        if (!selectedOrder)
            return;
        const actionLabel = ORDER_STATUS_ACTION_LABEL[status] || status;
        const title = status === "deleted" ? "Cập nhật đơn hàng" : "Hoàn thành đơn hàng";
        const message = status === "deleted"
            ? "Bạn có chắc muốn chuyển đơn hàng này sang trạng thái đã xóa?"
            : "Bạn có chắc muốn đánh dấu đơn hàng này là hoàn thành?";
        Alert.alert(title, message, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xác nhận",
                onPress: async () => {
                    dispatch(clearOrderError());
                    const result = await dispatch(updateOrderStatusThunk({
                        id: selectedOrder._id,
                        status,
                    }));
                    if (updateOrderStatusThunk.rejected.match(result)) {
                        Alert.alert("Không thể cập nhật", result.payload || `Không thể chuyển đơn hàng sang "${actionLabel}".`);
                    }
                },
            },
        ]);
    }, [selectedOrder, dispatch]);
    const handlePaymentStatusChange = useCallback((status) => {
        if (!selectedOrder?.payment) {
            return;
        }
        const nextLabel = PAYMENT_STATUS_ACTION_LABEL[status] || status;
        Alert.alert("Cập nhật thanh toán", `Bạn muốn chuyển thanh toán này sang "${nextLabel}"?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xác nhận",
                onPress: async () => {
                    const result = await dispatch(updatePaymentStatusThunk({
                        paymentId: selectedOrder.payment._id,
                        status,
                    }));
                    if (updatePaymentStatusThunk.rejected.match(result)) {
                        Alert.alert("Không thể cập nhật", result.payload || "Cập nhật trạng thái thanh toán thất bại.");
                        return;
                    }
                    dispatch(fetchOrderByIdThunk(selectedOrder._id));
                },
            },
        ]);
    }, [dispatch, selectedOrder]);
    if (isLoading && !selectedOrder) {
        return (<SafeAreaView className="flex-1 items-center justify-center bg-page">
        <ActivityIndicator size="large" color={Colors.indigo600}/>
      </SafeAreaView>);
    }
    const order = selectedOrder;
    const isPopulatedCustomer = order?.customerId && typeof order?.customerId === "object";
    const displayCustomerName = isPopulatedCustomer
        ? order.customerId.name || order.customerId.phone || "—"
        : user?.name || user?.phone || "—";
    const displayCustomerPhone = isPopulatedCustomer
        ? order.customerId.phone
        : user?.phone || "—";
    return (<SafeAreaView className="flex-1 bg-page">
      {/* §5.2 Header with back button */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} className="h-10 w-10 items-center justify-center rounded-xl bg-white" style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}>
          <ArrowLeft size={20} color={Colors.slate700} weight="bold"/>
        </Pressable>
        <Text className="flex-1 text-lg font-extrabold text-slate-900">
          Chi tiết đơn hàng
        </Text>
        {order && (<View className={`rounded-lg px-2.5 py-1 ${orderStatusMeta.bg}`}>
            <Text className={`text-xs font-bold ${orderStatusMeta.text}`}>
              {orderStatusMeta.label}
            </Text>
          </View>)}
      </View>

      {/* Error */}
      {error && (<View className="mx-6 mb-2 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm font-semibold text-red-600">{error}</Text>
        </View>)}

      {order && (<ScrollView contentContainerStyle={layoutContainer} contentContainerClassName="px-6 pb-8">
          {/* ── Order ID + Date ── */}
          <SectionCard title="THÔNG TIN ĐƠN">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-slate-500">Mã đơn</Text>
              <Text className="text-sm font-bold text-slate-900">
                #{order._id.slice(-8).toUpperCase()}
              </Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-slate-500">
                Ngày tạo
              </Text>
              <Text className="text-sm font-semibold text-slate-700">
                {formatDate(order.createdAt)}
              </Text>
            </View>
            {order.completedAt && (<View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-slate-500">
                  Hoàn thành
                </Text>
                <Text className="text-sm font-semibold text-green-600">
                  {formatDate(order.completedAt)}
                </Text>
              </View>)}
            {order.note ? (<View className="mt-3 rounded-xl bg-slate-50 p-3">
                <Text className="text-sm font-medium text-slate-600 italic">
                  {order.note}
                </Text>
              </View>) : null}
          </SectionCard>

          {/* ── Customer info ── */}
          <SectionCard title="KHÁCH HÀNG">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <User size={20} color={Colors.indigo600} weight="bold"/>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">
                  {displayCustomerName}
                </Text>
                <Text className="text-xs font-medium text-slate-500">
                  {displayCustomerPhone}
                </Text>
              </View>
            </View>

            {/* Account Status */}
            {isPopulatedCustomer &&
                (order.customerId?.isVerified !== undefined ||
                    order.customerId?.hasPassword !== undefined) && (<View className="mt-4 flex-row items-center gap-2 border-t border-slate-100 pt-3">
                  {order.customerId.isVerified ? (<View className="rounded bg-green-50 px-2 py-1">
                      <Text className="text-[10px] font-bold text-green-700">
                        ĐÃ XÁC THỰC
                      </Text>
                    </View>) : (<View className="rounded bg-red-50 px-2 py-1">
                      <Text className="text-[10px] font-bold text-red-700">
                        CHƯA XÁC THỰC
                      </Text>
                    </View>)}

                  {order.customerId.hasPassword ? (<View className="rounded bg-indigo-50 px-2 py-1">
                      <Text className="text-[10px] font-bold text-indigo-700">
                        ĐÃ TẠO MẬT KHẨU
                      </Text>
                    </View>) : (<View className="rounded bg-amber-50 px-2 py-1">
                      <Text className="text-[10px] font-bold text-amber-700">
                        CHƯA CÓ MẬT KHẨU
                      </Text>
                    </View>)}
                </View>)}
          </SectionCard>

          {/* ── Items ── */}
          <SectionCard title="DỊCH VỤ">
            {order.orderItems.map((item) => (<ItemRow key={item._id} item={item}/>))}
            {/* Total */}
            <View className="mt-3 flex-row items-center justify-between border-t border-slate-200 pt-3">
              <Text className="text-sm font-bold text-slate-900">
                Tổng cộng
              </Text>
              <Text className="text-lg font-extrabold text-indigo-600">
                {formatPrice(order.totalPrice)}
              </Text>
            </View>
          </SectionCard>

          {/* ── Payment info ── */}
          {order.payment ? (<View>
              <PaymentSummary payment={order.payment}/>
              {showPaymentActions && (<SectionCard title="XỬ LÝ THANH TOÁN">
                  {updatingPaymentId === order.payment._id ? (<View className="flex-row items-center py-2">
                      <ActivityIndicator size="small" color={Colors.indigo600}/>
                      <Text className="ml-2 text-sm font-medium text-slate-500">
                        Đang cập nhật thanh toán...
                      </Text>
                    </View>) : nextPaymentStatuses.length > 0 ? (<View className="flex-row flex-wrap gap-2">
                      {nextPaymentStatuses.map((status) => (<ActionButton
                          key={status}
                          label={PAYMENT_STATUS_ACTION_LABEL[status]}
                          onPress={() => handlePaymentStatusChange(status)}
                          tone={status === "paid" ? "success" : status === "refunded" ? "default" : "danger"}
                        />))}
                    </View>) : (<Text className="text-sm font-medium text-slate-400">
                      Không có thao tác thanh toán khả dụng.
                    </Text>)}
                </SectionCard>)}
            </View>) : (<SectionCard title="THANH TOÁN">
              <View className="items-center py-4">
                <CreditCard size={24} color={Colors.slate300} weight="bold"/>
                <Text className="mt-2 text-sm font-medium text-slate-400">
                  Chưa có thanh toán
                </Text>
                {canCreatePayment && (<Pressable onPress={() => navigation.navigate("CreatePayment", {
                        orderId: order._id,
                        amount: order.totalPrice,
                    })} className="mt-4 flex-row items-center justify-center rounded-xl bg-indigo-50 px-6 py-3" style={({ pressed }) => pressedStyleSmall(pressed)}>
                    <Text className="text-sm font-bold text-indigo-700">
                      Tạo thanh toán mới
                    </Text>
                  </Pressable>)}
              </View>
            </SectionCard>)}

          {showOrderActions && (<SectionCard title="XỬ LÝ ĐƠN HÀNG">
              <View className="flex-row flex-wrap gap-2">
                <ActionButton label="Hoàn thành" icon={CheckCircle} onPress={() => handleOrderStatusChange("completed")} disabled={!canCompleteOrder || isLoading} tone="success"/>
                {canDeleteOrder && (<ActionButton label="Đã xóa" icon={Trash} onPress={() => handleOrderStatusChange("deleted")} disabled={isLoading} tone="danger"/>)}
              </View>
              {!canCompleteOrder && order.status === "pending" && (<Text className="mt-3 text-sm font-medium leading-6 text-slate-500">
                  Đơn hàng chỉ có thể hoàn thành khi thanh toán đang ở trạng thái "Đã thanh toán".
                </Text>)}
            </SectionCard>)}

        </ScrollView>)}
    </SafeAreaView>);
}
