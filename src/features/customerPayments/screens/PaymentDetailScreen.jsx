import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { CreditCard, Receipt, Calendar, Code, ArrowLeft, } from "phosphor-react-native";
import { Colors, shadowCard } from "@/theme/tokens";
import { useAppSelector } from "@/app/store";
import PaymentStatusBadge from "../components/PaymentStatusBadge";
import { SafeAreaView } from "react-native-safe-area-context";
function formatPrice(amount) {
    return amount.toLocaleString("vi-VN") + "đ";
}
function formatDate(iso) {
    if (!iso)
        return "—";
    return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
const METHOD_LABEL = {
    cash: "Tiền mặt",
    momo: "Ví MoMo",
    vnpay: "VNPay",
    bank: "Chuyển khoản",
};
export default function PaymentDetailScreen({ navigation }) {
    const { selectedPayment } = useAppSelector((state) => state.customerPayments);
    if (!selectedPayment) {
        return (<View className="flex-1 items-center justify-center bg-slate-50 p-4">
        <Text className="text-slate-500">
          Không tìm thấy thông tin thanh toán
        </Text>
      </View>);
    }
    const { amount, method, status, createdAt, transactionRef, orderId, paidAt } = selectedPayment;
    const customerLabel = selectedPayment.customerName ||
        selectedPayment.customerPhone ||
        (selectedPayment.customerId
            ? `#${selectedPayment.customerId.slice(-6).toUpperCase()}`
            : null);
    return (<SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center border-b border-slate-200 bg-white px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} className="mr-4 p-2">
          <ArrowLeft size={24} color={Colors.slate900}/>
        </Pressable>
        <Text className="text-lg font-bold text-slate-900">
          Chi tiết thanh toán
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-6 items-center">
          <Text className="text-sm font-medium text-slate-500">Số tiền</Text>
          <Text className="mt-1 text-3xl font-extrabold text-indigo-600">
            {formatPrice(amount)}
          </Text>
          <View className="mt-3">
            <PaymentStatusBadge status={status}/>
          </View>
        </View>

        <View className="rounded-2xl border border-slate-100 bg-white p-5" style={shadowCard}>
          <Text className="mb-4 text-base font-bold text-slate-900">
            Thông tin chi tiết
          </Text>

          <View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
            <View className="flex-row items-center">
              <Receipt size={20} color={Colors.slate400}/>
              <Text className="ml-2 text-sm font-medium text-slate-600">
                Mã đơn hàng
              </Text>
            </View>
            <Text className="text-sm font-bold text-slate-900">
              #{selectedPayment.orderCode || orderId.slice(-8).toUpperCase()}
            </Text>
          </View>

          {customerLabel && (<View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
              <View className="flex-row items-center">
                <Receipt size={20} color={Colors.slate400}/>
                <Text className="ml-2 text-sm font-medium text-slate-600">
                  Khách hàng
                </Text>
              </View>
              <Text className="text-sm font-bold text-slate-900">
                {customerLabel}
              </Text>
            </View>)}

          <View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
            <View className="flex-row items-center">
              <CreditCard size={20} color={Colors.slate400}/>
              <Text className="ml-2 text-sm font-medium text-slate-600">
                Phương thức
              </Text>
            </View>
            <Text className="text-sm font-bold text-slate-900">
              {METHOD_LABEL[method] || method.toUpperCase()}
            </Text>
          </View>

          <View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
            <View className="flex-row items-center">
              <Calendar size={20} color={Colors.slate400}/>
              <Text className="ml-2 text-sm font-medium text-slate-600">
                Ngày tạo
              </Text>
            </View>
            <Text className="text-sm font-bold text-slate-900">
              {formatDate(createdAt)}
            </Text>
          </View>

          {status === "paid" && (<View className="mb-4 flex-row justify-between border-b border-slate-100 pb-4">
              <View className="flex-row items-center">
                <Calendar size={20} color={Colors.slate400}/>
                <Text className="ml-2 text-sm font-medium text-slate-600">
                  Ngày thanh toán
                </Text>
              </View>
              <Text className="text-sm font-bold text-slate-900">
                {formatDate(paidAt)}
              </Text>
            </View>)}

          {transactionRef && (<View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Code size={20} color={Colors.slate400}/>
                <Text className="ml-2 text-sm font-medium text-slate-600">
                  Mã giao dịch
                </Text>
              </View>
              <Text className="text-sm font-bold text-slate-900">
                {transactionRef}
              </Text>
            </View>)}
        </View>
      </ScrollView>
    </SafeAreaView>);
}
