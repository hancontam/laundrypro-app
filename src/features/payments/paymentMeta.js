import { CheckCircle, ClockCountdown, XCircle, ArrowCounterClockwise } from "phosphor-react-native";
import { Colors } from "@/theme/tokens";

export const PAYMENT_METHOD_LABEL = {
    cash: "Tiền mặt",
};

export const PAYMENT_STATUS_META = {
    pending: {
        label: "Chờ thanh toán",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: ClockCountdown,
        color: "#D97706",
        valueClassName: "text-amber-600",
    },
    paid: {
        label: "Đã thanh toán",
        bg: "bg-green-50",
        text: "text-green-700",
        icon: CheckCircle,
        color: "#16A34A",
        valueClassName: "text-green-600",
    },
    failed: {
        label: "Thất bại",
        bg: "bg-red-50",
        text: "text-red-700",
        icon: XCircle,
        color: "#DC2626",
        valueClassName: "text-red-600",
    },
    refunded: {
        label: "Hoàn tiền",
        bg: "bg-slate-100",
        text: "text-slate-700",
        icon: ArrowCounterClockwise,
        color: Colors.slate600,
        valueClassName: "text-slate-600",
    },
};

export const PAYMENT_STATUS_ACTION_LABEL = {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    failed: "Thất bại",
    refunded: "Hoàn tiền",
};

export function getPaymentNextStatuses(status, { canRefund = false } = {}) {
    switch (status) {
        case "pending":
            return ["paid", "failed"];
        case "paid":
            return canRefund ? ["refunded"] : [];
        case "failed":
            return ["pending"];
        case "refunded":
        default:
            return [];
    }
}
