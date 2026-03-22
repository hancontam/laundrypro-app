import React from "react";
import { View, Text } from "react-native";
import { CheckCircle, ClockCountdown, XCircle, ArrowCounterClockwise, } from "phosphor-react-native";
import { Colors } from "@/theme/tokens";
const STATUS_CONFIG = {
    pending: {
        label: "Chờ thanh toán",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: ClockCountdown,
        color: "#D97706", // amber-600
    },
    paid: {
        label: "Đã thanh toán",
        bg: "bg-green-50",
        text: "text-green-700",
        icon: CheckCircle,
        color: "#16A34A", // green-600
    },
    failed: {
        label: "Thất bại",
        bg: "bg-red-50",
        text: "text-red-700",
        icon: XCircle,
        color: "#DC2626", // red-600
    },
    refunded: {
        label: "Hoàn tiền",
        bg: "bg-slate-100",
        text: "text-slate-700",
        icon: ArrowCounterClockwise,
        color: Colors.slate600,
    },
};
export default function PaymentStatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (<View className={`flex-row items-center gap-1.5 rounded-lg px-2.5 py-1 ${config.bg}`}>
      <Icon size={14} color={config.color} weight="bold"/>
      <Text className={`text-xs font-bold ${config.text}`}>{config.label}</Text>
    </View>);
}
