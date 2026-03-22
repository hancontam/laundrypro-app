import React from "react";
import { View, Text, Pressable } from "react-native";
import { WarningCircle, ArrowsClockwise } from "phosphor-react-native";
import { Colors, pressedStyle, shadowOutline } from "@/theme/tokens";
export default function DashboardError({ error, onRetry }) {
    return (<View className="flex-1 items-center justify-center p-6">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <WarningCircle size={32} color={Colors.red600} weight="fill"/>
      </View>
      <Text className="mb-2 text-lg font-extrabold text-slate-900 text-center">
        Lỗi tải dữ liệu
      </Text>
      <Text className="mb-6 text-sm font-medium text-slate-500 text-center">
        {error}
      </Text>
      <Pressable onPress={onRetry} className="flex-row items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5" style={({ pressed }) => [shadowOutline, pressedStyle(pressed)]}>
        <ArrowsClockwise size={20} color={Colors.slate700} weight="bold"/>
        <Text className="text-sm font-bold text-slate-700">Thử lại</Text>
      </Pressable>
    </View>);
}
