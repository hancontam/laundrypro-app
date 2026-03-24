import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight } from "phosphor-react-native";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { createPaymentRequestThunk, clearPaymentError } from "../paymentSlice";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { Colors, shadowCTA, shadowFloating, pressedStyle, pressedStyleSmall, layoutContainer, } from "@/theme/tokens";
function formatPrice(amount) {
    return amount.toLocaleString("vi-VN") + "đ";
}
export default function CreatePaymentScreen({ navigation, route }) {
    const { orderId, amount } = route.params;
    const dispatch = useAppDispatch();
    const { isCreating, error } = useAppSelector((state) => state.payments);
    const [method, setMethod] = useState("cash");
    const handleCreatePayment = async () => {
        if (!method) {
            Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán");
            return;
        }
        dispatch(clearPaymentError());
        const resultAction = await dispatch(createPaymentRequestThunk({
            orderId,
            method,
            amount,
            markAsPaid: method === "cash", // If cash, mark as paid immediately
        }));
        if (createPaymentRequestThunk.fulfilled.match(resultAction)) {
            Alert.alert("Thành công", "Đã tạo yêu cầu thanh toán");
            navigation.goBack();
        }
    };
    return (<SafeAreaView className="flex-1 bg-page">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} className="h-10 w-10 items-center justify-center rounded-xl bg-white" style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}>
          <ArrowLeft size={20} color={Colors.slate700} weight="bold"/>
        </Pressable>
        <Text className="flex-1 text-lg font-extrabold text-slate-900">
          Tạo thanh toán
        </Text>
      </View>

      <ScrollView contentContainerStyle={layoutContainer} contentContainerClassName="px-6 py-4" keyboardShouldPersistTaps="handled">
        {/* Error Banner */}
        {error && (<View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm font-semibold text-red-600">{error}</Text>
          </View>)}

        <View className="mb-6 items-center">
          <Text className="text-sm font-medium text-slate-500">
            Số tiền cần thanh toán
          </Text>
          <Text className="mt-1 text-3xl font-extrabold text-indigo-600">
            {formatPrice(amount)}
          </Text>
        </View>

        <PaymentMethodSelector selectedMethod={method} onSelect={setMethod}/>

        <Pressable onPress={handleCreatePayment} disabled={!method || isCreating} className={`mt-4 flex-row items-center justify-center rounded-xl py-4 ${!method ? "bg-slate-300" : "bg-indigo-600"}`} style={({ pressed }) => [
            method && shadowCTA,
            pressedStyle(pressed),
            { opacity: isCreating || !method ? 0.7 : 1 },
        ]}>
          {isCreating ? (<ActivityIndicator color="#fff"/>) : (<>
              <Text className="mr-2 text-base font-bold text-white">
                Xác nhận thanh toán
              </Text>
              <ArrowRight size={20} color="#fff" weight="bold"/>
            </>)}
        </Pressable>
      </ScrollView>
    </SafeAreaView>);
}

