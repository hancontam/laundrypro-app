// src/features/customerPayments/screens/PaymentHistoryScreen.tsx
import React, { useEffect } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchPaymentHistoryThunk,
  setSelectedPayment,
} from "../customerPaymentsSlice";
import PaymentHistoryItem from "../components/PaymentHistoryItem";
import { Colors } from "@/theme/tokens";

type RootStackParamList = {
  PaymentHistory: undefined;
  PaymentDetail: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "PaymentHistory">;

export default function PaymentHistoryScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { paymentHistory, loading, error } = useAppSelector(
    (state: any) => state.customerPayments,
  );

  useEffect(() => {
    dispatch(fetchPaymentHistoryThunk());
  }, [dispatch]);

  const handlePressPayment = (payment: any) => {
    dispatch(setSelectedPayment(payment));
    navigation.navigate("PaymentDetail");
  };

  if (loading && paymentHistory.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={Colors.indigo600} />
      </View>
    );
  }

  if (error && paymentHistory.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-center text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-4">
      <FlatList
        data={paymentHistory}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PaymentHistoryItem payment={item} onPress={handlePressPayment} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-12 items-center justify-center">
              <Text className="text-slate-500">
                Bạn chưa có lịch sử thanh toán nào
              </Text>
            </View>
          ) : null
        }
        refreshing={loading}
        onRefresh={() => dispatch(fetchPaymentHistoryThunk())}
      />
    </View>
  );
}
