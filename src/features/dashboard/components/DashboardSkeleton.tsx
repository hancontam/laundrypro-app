import React from "react";
import { View } from "react-native";
import { shadowCard } from "@/theme/tokens";

export default function DashboardSkeleton() {
  return (
    <View className="flex-1">
      {/* Overview Cards Skeleton */}
      <View className="flex-row flex-wrap justify-between mb-6">
        {[1, 2, 3, 4].map((item) => (
          <View
            key={item}
            className="w-[48%] mb-4 rounded-2xl border border-slate-100 bg-white p-4"
            style={shadowCard}
          >
            <View className="h-10 w-10 rounded-full bg-slate-100 mb-3" />
            <View className="h-4 w-20 bg-slate-100 rounded mb-2" />
            <View className="h-6 w-16 bg-slate-200 rounded" />
          </View>
        ))}
      </View>

      {/* Charts Skeleton */}
      <View
        className="rounded-2xl border border-slate-100 bg-white p-4 mb-6"
        style={shadowCard}
      >
        <View className="h-5 w-32 bg-slate-100 rounded mb-4" />
        <View className="h-48 w-full bg-slate-50 rounded-xl" />
      </View>

      <View
        className="rounded-2xl border border-slate-100 bg-white p-4 mb-6"
        style={shadowCard}
      >
        <View className="h-5 w-40 bg-slate-100 rounded mb-4" />
        <View className="h-48 w-full bg-slate-50 rounded-xl" />
      </View>
    </View>
  );
}
