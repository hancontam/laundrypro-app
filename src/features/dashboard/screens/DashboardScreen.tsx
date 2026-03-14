// src/features/dashboard/screens/DashboardScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, CalendarBlank } from "phosphor-react-native";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { MainStackParamList } from "@/app/navigation";
import {
  Colors,
  shadowFloating,
  pressedStyleSmall,
  layoutContainer,
} from "@/theme/tokens";
import { fetchDashboardStatsThunk } from "../dashboardSlice";
import { DashboardStats } from "../types";

// Components
import DashboardSkeleton from "../components/DashboardSkeleton";
import DashboardError from "../components/DashboardError";
import SystemOverview from "../components/SystemOverview";
import RevenueSummaryChart from "../components/RevenueSummaryChart";
import OrderStatisticsChart from "../components/OrderStatisticsChart";

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, any>;
};

export default function DashboardScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stats, isLoading, error } = useAppSelector((state) => state.dashboard);
  const isAdmin = user?.role === "admin";
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    // By default, fetch without date filters to get all-time or default range
    dispatch(fetchDashboardStatsThunk(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDashboardStatsThunk(undefined));
    setRefreshing(false);
  }, [dispatch]);

  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-page items-center justify-center">
        <Text className="text-slate-500 font-medium">
          Bạn không có quyền truy cập trang này.
        </Text>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    if (isLoading && !refreshing) {
      return (
        <View className="flex-1 px-6 pt-6">
          <DashboardSkeleton />
        </View>
      );
    }

    if (error && !stats) {
      return <DashboardError error={error} onRetry={loadData} />;
    }

    // Default empty shape if stats is null but loaded
    const currentStats: DashboardStats = (stats as any)?.data || stats || {
      byStatus: [],
      revenue: {
        _id: null,
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
      },
      daily: [],
      topCustomers: []
    };

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-6 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <SystemOverview revenue={currentStats.revenue} byStatus={currentStats.byStatus} />

        <RevenueSummaryChart data={currentStats.daily || []} />

        <OrderStatisticsChart data={currentStats.byStatus || []} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-page" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2 z-10">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white"
            style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
          >
            <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
          </Pressable>
          <Text className="text-2xl font-extrabold text-slate-900">
            Thống kê
          </Text>
        </View>

        {!isLoading && !error && (
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-xl bg-white"
            style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
          >
            <CalendarBlank size={20} color={Colors.slate700} weight="bold" />
          </Pressable>
        )}
      </View>

      <View className="flex-1 w-full mx-auto" style={layoutContainer}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
