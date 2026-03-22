import React from "react";
import { View, Text } from "react-native";
import { shadowCard, labelStyle } from "@/theme/tokens";
import { PAYMENT_METHOD_LABEL, PAYMENT_STATUS_META } from "../paymentMeta";
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
function InfoRow({ label, value, valueClassName = "text-slate-900", }) {
    return (<View className="mt-2 flex-row items-center justify-between">
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      <Text className={`text-sm font-bold ${valueClassName}`}>{value}</Text>
    </View>);
}
export default function PaymentSummary({ payment }) {
    const statusMeta = PAYMENT_STATUS_META[payment.status] || PAYMENT_STATUS_META.pending;
    return (<View className="mb-4 rounded-2xl border border-slate-100 bg-white p-4" style={shadowCard}>
      <Text className="mb-3 text-slate-400" style={labelStyle}>
        THÔNG TIN THANH TOÁN
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-500">Số tiền</Text>
        <Text className="text-lg font-extrabold text-indigo-600">
          {formatPrice(payment.amount)}
        </Text>
      </View>

      <InfoRow label="Phương thức" value={PAYMENT_METHOD_LABEL[payment.method] || payment.method}/>

      <InfoRow label="Trạng thái" value={statusMeta.label} valueClassName={statusMeta.valueClassName}/>

      {payment.transactionRef && (<InfoRow label="Mã GD" value={payment.transactionRef} valueClassName="text-slate-600 font-semibold text-xs"/>)}

      {payment.paidAt && (<InfoRow label="Ngày cập nhật" value={formatDate(payment.paidAt)} valueClassName="text-slate-700 font-semibold"/>)}
    </View>);
}
