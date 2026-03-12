// src/features/customerPayments/components/PaymentHistoryItem.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Receipt, CaretRight } from "phosphor-react-native";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { Colors, shadowCard, pressedStyle } from "@/theme/tokens";
import type { Payment } from "../types";

interface Props {
  payment: Payment;
  onPress: (payment: Payment) => void;
}

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

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Tiền mặt",
  momo: "MoMo",
  vnpay: "VNPay",
  bank: "Chuyển khoản",
};

export default function PaymentHistoryItem({ payment, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(payment)}
      className="mb-4 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4"
      style={({ pressed }) => [shadowCard, pressedStyle(pressed)]}
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
        <Receipt size={24} color={Colors.indigo600} weight="fill" />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-slate-900">
            {formatPrice(payment.amount)}
          </Text>
          <PaymentStatusBadge status={payment.status} />
        </View>

        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-slate-500">
            #{payment.orderId.slice(-8).toUpperCase()}
          </Text>
          <Text className="text-xs font-medium text-slate-400">
            {formatDate(payment.createdAt)}
          </Text>
        </View>
        <Text className="mt-1 text-xs font-semibold text-indigo-600">
          {PAYMENT_METHOD_LABEL[payment.method] || payment.method.toUpperCase()}
        </Text>
      </View>

      <View className="ml-2 pl-2">
        <CaretRight size={20} color={Colors.slate400} weight="bold" />
      </View>
    </Pressable>
  );
}
