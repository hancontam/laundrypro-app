import React from "react";
import { ScrollView, Pressable, Text, View } from "react-native";
import { pressedStyleSmall } from "@/theme/tokens";

export default function FilterChips({ options, value, onChange, }) {
    return (<View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
        <View className="flex-row items-center gap-2">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (<Pressable key={option.value} onPress={() => onChange(option.value)} className={`rounded-full border px-4 py-2 ${isSelected
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-slate-200 bg-white"}`} style={({ pressed }) => pressedStyleSmall(pressed)}>
                <Text className={`text-xs font-bold ${isSelected ? "text-indigo-700" : "text-slate-600"}`}>
                  {option.label}
                </Text>
              </Pressable>);
        })}
        </View>
      </ScrollView>
    </View>);
}
