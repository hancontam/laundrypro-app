// src/features/payments/components/PaymentSummary.tsx
import React from "react";
import { View, Text } from "react-native";
import { shadowCard, labelStyle } from "@/theme/tokens";
import type { Payment } from "../types";

interface Props {
  payment: Payment;
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Hoàn tiền",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Tiền mặt",
  momo: "MoMo",
  vnpay: "VNPay",
  bank: "Chuyển khoản",
};

function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({
  label,
  value,
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="mt-2 flex-row items-center justify-between">
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      <Text className={`text-sm font-bold ${valueClassName}`}>{value}</Text>
    </View>
  );
}

export default function PaymentSummary({ payment }: Props) {
  const isPaid = payment.status === "paid";

  return (
    <View
      className="mb-4 rounded-2xl border border-slate-100 bg-white p-4"
      style={shadowCard}
    >
      <Text className="mb-3 text-slate-400" style={labelStyle}>
        THÔNG TIN THANH TOÁN
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-500">Giới hạn</Text>
        <Text className="text-lg font-extrabold text-indigo-600">
          {formatPrice(payment.amount)}
        </Text>
      </View>

      <InfoRow
        label="Phương thức"
        value={PAYMENT_METHOD_LABEL[payment.method] || payment.method}
      />

      <InfoRow
        label="Trạng thái"
        value={PAYMENT_STATUS_LABEL[payment.status] || payment.status}
        valueClassName={isPaid ? "text-green-600" : "text-amber-600"}
      />

      {payment.transactionRef && (
        <InfoRow
          label="Mã GD"
          value={payment.transactionRef}
          valueClassName="text-slate-600 font-semibold text-xs"
        />
      )}

      {payment.paidAt && (
        <InfoRow
          label="Ngày cập nhật"
          value={formatDate(payment.paidAt)}
          valueClassName="text-slate-700 font-semibold"
        />
      )}
    </View>
  );
}
