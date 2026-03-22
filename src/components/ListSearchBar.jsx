import React from "react";
import { View, TextInput, Pressable, ActivityIndicator } from "react-native";
import { MagnifyingGlass, X } from "phosphor-react-native";
import { Colors, pressedStyleSmall, shadowCard } from "@/theme/tokens";

export default function ListSearchBar({ value, onChangeText, placeholder = "Tìm kiếm...", isLoading = false, }) {
    return (<View className="flex-row items-center rounded-2xl border border-slate-100 bg-white px-4 py-1.5" style={shadowCard}>
      <MagnifyingGlass size={18} color={Colors.slate400} weight="bold"/>
      <TextInput className="ml-3 flex-1 py-3 text-base font-medium text-slate-900" placeholder={placeholder} placeholderTextColor={Colors.slate300} value={value} onChangeText={onChangeText}/>
      {isLoading ? (<ActivityIndicator size="small" color={Colors.indigo600}/>) : value ? (<Pressable onPress={() => onChangeText("")} className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-slate-100" style={({ pressed }) => pressedStyleSmall(pressed)}>
          <X size={14} color={Colors.slate500} weight="bold"/>
        </Pressable>) : null}
    </View>);
}
