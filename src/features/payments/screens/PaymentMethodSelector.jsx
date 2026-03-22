import React from "react";
import { View, Text } from "react-native";
import PaymentMethodButton from "../components/PaymentMethodButton";
import { labelStyle } from "@/theme/tokens";
export default function PaymentMethodSelector({ selectedMethod, onSelect, }) {
    return (<View className="mb-6">
      <Text className="mb-3 text-slate-500" style={labelStyle}>
        CHỌN PHƯƠNG THỨC THANH TOÁN
      </Text>

      <PaymentMethodButton method="cash" label="Tiền mặt" description="Thu tiền mặt trực tiếp từ khách hàng" isSelected={selectedMethod === "cash"} onPress={onSelect}/>
    </View>);
}
