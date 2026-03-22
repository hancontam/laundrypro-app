import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Receipt, CaretRight } from "phosphor-react-native";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { Colors, shadowCard, pressedStyle } from "@/theme/tokens";
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
const PAYMENT_METHOD_LABEL = {
    cash: "Tiền mặt",
    momo: "MoMo",
    vnpay: "VNPay",
    bank: "Chuyển khoản",
};
const STATUS_ACTIONS = {
    pending: ["paid", "failed", "refunded"],
    paid: ["refunded"],
    failed: ["pending", "paid", "refunded"],
    refunded: [],
};
const STATUS_ACTION_LABEL = {
    pending: "Chờ",
    paid: "Đã thanh toán",
    failed: "Thất bại",
    refunded: "Hoàn tiền",
};
export default function PaymentHistoryItem({ payment, onPress, showStatusActions = false, isUpdating = false, onStatusChange, }) {
    const customerLabel = payment.customerName ||
        payment.customerPhone ||
        (payment.customerId ? `Khách #${payment.customerId.slice(-6).toUpperCase()}` : null);
    const nextStatuses = STATUS_ACTIONS[payment.status];
    return (<Pressable onPress={() => onPress(payment)} className="mb-4 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4" style={({ pressed }) => [shadowCard, pressedStyle(pressed)]}>
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
        <Receipt size={24} color={Colors.indigo600} weight="fill"/>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-slate-900">
            {formatPrice(payment.amount)}
          </Text>
          <PaymentStatusBadge status={payment.status}/>
        </View>

        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-slate-500">
            #{payment.orderCode || payment.orderId.slice(-8).toUpperCase()}
          </Text>
          <Text className="text-xs font-medium text-slate-400">
            {formatDate(payment.createdAt)}
          </Text>
        </View>
        {customerLabel && (<Text className="mt-1 text-xs font-medium text-slate-500">
            {customerLabel}
          </Text>)}
        <Text className="mt-1 text-xs font-semibold text-indigo-600">
          {PAYMENT_METHOD_LABEL[payment.method] || payment.method.toUpperCase()}
        </Text>

        {showStatusActions && (<View className="mt-3">
            <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-slate-400">
              Cập nhật trạng thái
            </Text>
            {isUpdating ? (<View className="flex-row items-center">
                <ActivityIndicator size="small" color={Colors.indigo600}/>
                <Text className="ml-2 text-xs font-medium text-slate-500">
                  Đang cập nhật...
                </Text>
              </View>) : nextStatuses.length > 0 ? (<View className="flex-row flex-wrap gap-2">
                {nextStatuses.map((status) => (<Pressable key={status} onPress={() => onStatusChange?.(payment, status)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2" style={({ pressed }) => pressedStyle(pressed)}>
                    <Text className="text-xs font-bold text-slate-700">
                      {STATUS_ACTION_LABEL[status]}
                    </Text>
                  </Pressable>))}
              </View>) : (<Text className="text-xs font-medium text-slate-400">
                Không thể cập nhật thêm
              </Text>)}
          </View>)}
      </View>

      <View className="ml-2 pl-2">
        <CaretRight size={20} color={Colors.slate400} weight="bold"/>
      </View>
    </Pressable>);
}
