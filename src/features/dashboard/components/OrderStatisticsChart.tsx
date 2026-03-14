import React from "react";
import { View, Text, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Colors, shadowCard } from "@/theme/tokens";
import { DashboardStats } from "../types";

interface Props {
  data: DashboardStats['byStatus'];
}

export default function OrderStatisticsChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <View
        className="mb-6 rounded-2xl border border-slate-100 bg-white p-6"
        style={shadowCard}
      >
        <Text className="text-lg font-extrabold text-slate-900 mb-4">
          Trạng thái đơn hàng
        </Text>
        <View className="items-center justify-center h-48 bg-slate-50 rounded-xl">
          <Text className="text-slate-400 font-medium">Chưa có dữ liệu</Text>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width;

  const colorMap: Record<string, string> = {
    pending: "#F59E0B",     // amber-500
    processing: "#3B82F6",  // blue-500
    completed: Colors.green500,
    cancelled: Colors.red600,
  };

  const labelMap: Record<string, string> = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    completed: "Hoàn thành",
    cancelled: "Đã huỷ",
  };

  const chartData = data.map((item) => ({
    name: labelMap[item._id.toLowerCase()] || item._id,
    population: item.count,
    color: colorMap[item._id.toLowerCase()] || Colors.slate500,
    legendFontColor: Colors.slate700,
    legendFontSize: 12,
  }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View
      className="mb-6 rounded-2xl border border-slate-100 bg-white p-6"
      style={shadowCard}
    >
      <Text className="text-lg font-extrabold text-slate-900 mb-4">
        Trạng thái đơn hàng
      </Text>
      <View className="items-center">
        <PieChart
          data={chartData}
          width={screenWidth - 80}
          height={200}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          center={[10, 0]}
          absolute
        />
      </View>
    </View>
  );
}
