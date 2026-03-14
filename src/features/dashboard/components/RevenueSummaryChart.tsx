import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Colors, shadowCard } from "@/theme/tokens";
import { DashboardStats } from "../types";

interface Props {
  data: DashboardStats['daily'];
}

export default function RevenueSummaryChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <View
        className="mb-6 rounded-2xl border border-slate-100 bg-white p-6"
        style={shadowCard}
      >
        <Text className="text-lg font-extrabold text-slate-900 mb-4">
          Doanh thu (30 ngày)
        </Text>
        <View className="items-center justify-center h-48 bg-slate-50 rounded-xl">
          <Text className="text-slate-400 font-medium">
            Chưa có dữ liệu doanh thu
          </Text>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width;

  // We only want a maximum of ~6 labels to prevent squeezing.
  // Data comes sorted by date descending, reverse to ascending for chart
  const sortedData = [...data].reverse();
  const step = Math.ceil(sortedData.length / 6);
  
  const labels = sortedData.map((d, index) => {
    if (index % step === 0 || index === sortedData.length - 1) {
      const dateParts = d._id.split("-");
      return `${dateParts[2]}/${dateParts[1]}`;
    }
    return '';
  });
  
  const revenues = sortedData.map((d) => d.revenue);

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // indigo-500
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // slate-500
    strokeWidth: 3, 
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: Colors.indigo600,
    },
    fillShadowGradientFrom: Colors.indigo50,
    fillShadowGradientFromOpacity: 0.8,
    fillShadowGradientTo: "#ffffff",
    fillShadowGradientToOpacity: 0.1,
  };

  return (
    <View
      className="mb-6 rounded-2xl border border-slate-100 bg-white p-6"
      style={shadowCard}
    >
      <Text className="text-lg font-extrabold text-slate-900 mb-4">
        Doanh thu (30 ngày)
      </Text>
      <View className="overflow-hidden items-center">
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: revenues,
              },
            ],
          }}
          width={screenWidth - 48 - 12} // Adjust to fit padding
          height={220}
          yAxisLabel="₫"
          yAxisSuffix="k"
          yAxisInterval={1} 
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 12,
            marginLeft: -24,
          }}
          formatYLabel={(y) => (parseInt(y) / 1000).toString()}
        />
      </View>
    </View>
  );
}
