// src/features/payments/components/PaymentMethodButton.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";
import { CheckCircle, Money, Wallet } from "phosphor-react-native";
import { Colors, shadowCard, pressedStyle } from "@/theme/tokens";
import type { PaymentMethod } from "../types";

interface Props {
  method: PaymentMethod;
  isSelected: boolean;
  onPress: (method: PaymentMethod) => void;
  label: string;
  description?: string;
}

export default function PaymentMethodButton({
  method,
  isSelected,
  onPress,
  label,
  description,
}: Props) {
  const isCash = method === "cash";
  const Icon = isCash ? Money : Wallet;

  return (
    <Pressable
      onPress={() => onPress(method)}
      className={`mb-4 flex-row items-center rounded-2xl border p-4 ${
        isSelected
          ? "border-indigo-500 bg-indigo-50/30"
          : "border-slate-100 bg-white"
      }`}
      style={({ pressed }) => [
        !isSelected && shadowCard,
        pressedStyle(pressed),
      ]}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-full ${
          isSelected ? "bg-indigo-100" : "bg-slate-50"
        }`}
      >
        <Icon
          size={24}
          color={isSelected ? Colors.indigo600 : Colors.slate400}
          weight={isSelected ? "fill" : "bold"}
        />
      </View>

      <View className="ml-4 flex-1">
        <Text
          className={`text-base font-bold ${
            isSelected ? "text-indigo-900" : "text-slate-900"
          }`}
        >
          {label}
        </Text>
        {description && (
          <Text
            className={`mt-0.5 text-sm font-medium ${
              isSelected ? "text-indigo-700" : "text-slate-500"
            }`}
          >
            {description}
          </Text>
        )}
      </View>

      <View className="ml-2 h-6 w-6 items-center justify-center">
        {isSelected && (
          <CheckCircle size={24} color={Colors.indigo600} weight="fill" />
        )}
      </View>
    </Pressable>
  );
}
