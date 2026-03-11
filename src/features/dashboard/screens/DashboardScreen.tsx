// src/features/dashboard/screens/DashboardScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowLeft,
  Graph,
  ChatCircleText,
  CaretRight,
} from "phosphor-react-native";
import { useAppSelector } from "@/app/store";
import { MainStackParamList } from "@/app/navigation"; // Update with proper param list if needed
import {
  Colors,
  shadowCard,
  shadowFloating,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
} from "@/theme/tokens";

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, any>; // Adjust as needed
};

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-page items-center justify-center">
        <Text className="text-slate-500 font-medium">
          Bạn không có quyền truy cập trang này.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-page" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white"
          style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}
        >
          <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
        </Pressable>
        <Text className="text-2xl font-extrabold text-slate-900">
          Dashboard
        </Text>
      </View>

      <View className="flex-1 px-6 pt-6" style={layoutContainer}>
        {/* Banner */}
        <View className="mb-6 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
            <Graph size={32} color={Colors.indigo600} weight="bold" />
          </View>
          <Text className="text-xl font-extrabold text-slate-900 text-center">
            Quản trị hệ thống
          </Text>
          <Text className="mt-2 text-sm font-medium text-slate-500 text-center">
            Theo dõi và quản lý các hoạt động quan trọng của hệ thống.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-3">
          {/* View Contact Requests */}
          <Pressable
            onPress={() => navigation.navigate("ContactRequestList")}
            className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-5"
            style={({ pressed }) => [shadowCard, pressedStyle(pressed)]}
          >
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                <ChatCircleText
                  size={24}
                  color={Colors.indigo600}
                  weight="bold"
                />
              </View>
              <View>
                <Text className="text-base font-bold text-slate-900">
                  Yêu cầu liên hệ
                </Text>
                <Text className="text-xs font-medium text-slate-500 mt-1">
                  Xem câu hỏi từ khách
                </Text>
              </View>
            </View>
            <CaretRight size={20} color={Colors.slate400} weight="bold" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
