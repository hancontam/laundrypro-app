import React from "react";
import { View, Text } from "react-native";
import { ClipboardText, CurrencyCircleDollar, MathOperations } from "phosphor-react-native";
import { Colors, shadowCard } from "@/theme/tokens";
export default function SystemOverview({ revenue, byStatus = [] }) {
    const totalOrdersVal = byStatus.reduce((sum, item) => sum + item.count, 0);
    const completedOrders = byStatus.find(s => s._id.toLowerCase() === 'completed')?.count || 0;
    const cards = [
        {
            title: "Tổng Đơn",
            value: totalOrdersVal,
            icon: <ClipboardText size={24} color={Colors.indigo600} weight="fill"/>,
            bg: "bg-indigo-50",
        },
        {
            title: "Hoàn Thành",
            value: completedOrders,
            icon: <ClipboardText size={24} color={Colors.green600} weight="fill"/>,
            bg: "bg-green-50",
        },
        {
            title: "Doanh Thu",
            value: `${((revenue?.totalRevenue || 0) / 1000).toFixed(0)}k`,
            icon: <CurrencyCircleDollar size={24} color={"#F97316"} weight="fill"/>, // orange-500
            bg: "bg-orange-50",
        },
        {
            title: "Giá Trị TB",
            value: `${((revenue?.avgOrderValue || 0) / 1000).toFixed(0)}k`,
            icon: <MathOperations size={24} color={"#3B82F6"} weight="fill"/>, // blue-500
            bg: "bg-blue-50",
        },
    ];
    return (<View className="flex-row flex-wrap justify-between mb-6">
      {cards.map((card, index) => (<View key={index} className="mb-4 w-[48%] rounded-2xl border border-slate-100 bg-white p-4" style={shadowCard}>
          <View className={`mb-3 h-10 w-10 items-center justify-center rounded-full ${card.bg}`}>
            {card.icon}
          </View>
          <Text className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {card.title}
          </Text>
          <Text className="text-2xl font-extrabold text-slate-900">
            {card.value}
          </Text>
        </View>))}
    </View>);
}
