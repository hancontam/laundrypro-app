// src/features/contact/screens/ContactUsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowLeft,
  PaperPlaneRight,
  User,
  EnvelopeSimple,
  ChatCircleText,
  TextT,
} from "phosphor-react-native";

import { MainStackParamList } from "@/app/navigation"; // Update with proper param list if needed
import { sendContactMessage } from "../contactService";
import {
  Colors,
  shadowFloating,
  shadowCTA,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
  labelStyle,
} from "@/theme/tokens";
import { AuthStackParamList } from "@/app/navigation";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, any>; // Adjust as needed
};

export default function ContactUsScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim() && email.trim() && message.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setError("");
    setIsLoading(true);
    try {
      await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      Alert.alert(
        "Thành công",
        "Tin nhắn của bạn đã được gửi. Chúng tôi sẽ liên hệ trong thời gian sớm nhất!",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white"
            style={({ pressed }) => [
              shadowFloating,
              pressedStyleSmall(pressed),
            ]}
          >
            <ArrowLeft size={20} color={Colors.slate700} weight="bold" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={layoutContainer}
          contentContainerClassName="flex-grow px-6 py-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Area */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <PaperPlaneRight
                size={32}
                color={Colors.indigo600}
                weight="bold"
              />
            </View>
            <Text className="text-2xl font-extrabold text-slate-900 text-center">
              Liên hệ
            </Text>
            <Text className="mt-2 text-sm font-medium text-slate-500 text-center">
              Gửi tin nhắn cho chúng tôi nếu bạn cần hỗ trợ.
            </Text>
          </View>

          {/* Form */}
          <View className="w-full">
            {error ? (
              <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
                <Text className="text-sm font-semibold text-red-600">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Name */}
            <View className="mb-5">
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                HỌ TÊN
              </Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <User size={20} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900"
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={Colors.slate300}
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                EMAIL
              </Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <EnvelopeSimple
                  size={20}
                  color={Colors.slate400}
                  weight="bold"
                />
                <TextInput
                  className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900"
                  placeholder="Nhập email của bạn"
                  placeholderTextColor={Colors.slate300}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Subject */}
            <View className="mb-5">
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                CHỦ ĐỀ
              </Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <TextT size={20} color={Colors.slate400} weight="bold" />
                <TextInput
                  className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900"
                  placeholder="Ví dụ: Cần hỗ trợ đơn hàng"
                  placeholderTextColor={Colors.slate300}
                  value={subject}
                  onChangeText={setSubject}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Message */}
            <View className="mb-8">
              <Text className="mb-2 text-slate-500" style={labelStyle}>
                NỘI DUNG
              </Text>
              <View className="rounded-xl border border-slate-200 bg-slate-50 p-3 pt-3 flex-row items-start">
                <ChatCircleText
                  size={20}
                  color={Colors.slate400}
                  weight="bold"
                  style={{ marginTop: 2 }}
                />
                <TextInput
                  className="ml-3 flex-1 text-base font-semibold text-slate-900"
                  placeholder="Nhập nội dung cần hỗ trợ..."
                  placeholderTextColor={Colors.slate300}
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                  value={message}
                  onChangeText={setMessage}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading || !canSubmit}
              className="flex-row items-center justify-center rounded-xl bg-slate-900 py-4"
              style={({ pressed }) => [
                shadowCTA,
                pressedStyle(pressed),
                { opacity: isLoading || !canSubmit ? 0.5 : 1 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="mr-2 text-base font-bold text-white">
                    Gửi liên hệ
                  </Text>
                  <PaperPlaneRight size={20} color="#fff" weight="bold" />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
