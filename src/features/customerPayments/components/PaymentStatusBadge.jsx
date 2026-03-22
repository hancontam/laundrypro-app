import React from "react";
import { View, Text } from "react-native";
import { PAYMENT_STATUS_META } from "@/features/payments/paymentMeta";
export default function PaymentStatusBadge({ status }) {
    const config = PAYMENT_STATUS_META[status] || PAYMENT_STATUS_META.pending;
    const Icon = config.icon;
    return (<View className={`flex-row items-center gap-1.5 rounded-lg px-2.5 py-1 ${config.bg}`}>
      <Icon size={14} color={config.color} weight="bold"/>
      <Text className={`text-xs font-bold ${config.text}`}>{config.label}</Text>
    </View>);
}
