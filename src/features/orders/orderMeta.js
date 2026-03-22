import { Colors } from "@/theme/tokens";

export const ORDER_STATUS_META = {
    pending: {
        label: "Chờ xử lý",
        bg: "bg-amber-50",
        text: "text-amber-700",
        chartColor: "#F59E0B",
    },
    completed: {
        label: "Hoàn thành",
        bg: "bg-green-50",
        text: "text-green-700",
        chartColor: Colors.green500,
    },
    deleted: {
        label: "Đã xóa",
        bg: "bg-slate-100",
        text: "text-slate-600",
        chartColor: Colors.slate500,
    },
};

export const ORDER_STATUS_ACTION_LABEL = {
    completed: "Hoàn thành",
    deleted: "Đã xóa",
};
