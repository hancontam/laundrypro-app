import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PencilSimple, LockKey, SignOut, CaretRight, } from "phosphor-react-native";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { logoutThunk } from "@/features/auth/authSlice";
import { Colors, shadowCard, pressedStyle, layoutContainer, } from "@/theme/tokens";
function MenuRow({ icon: Icon, label, onPress, color = Colors.slate700, hideArrow = false, }) {
    return (<Pressable onPress={onPress} className="flex-row items-center justify-between border-b border-slate-100 py-4 last:border-b-0" style={({ pressed }) => pressedStyle(pressed)}>
      <View className="flex-row items-center gap-3">
        <Icon size={22} color={color} weight="bold"/>
        <Text className="text-base font-bold" style={{ color }}>
          {label}
        </Text>
      </View>
      {!hideArrow && (<CaretRight size={20} color={Colors.slate400} weight="bold"/>)}
    </Pressable>);
}
export default function ProfileScreen({ navigation }) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "admin";
    const [avatarLoadFailed, setAvatarLoadFailed] = React.useState(false);
    React.useEffect(() => {
        setAvatarLoadFailed(false);
    }, [user?.avatar]);
    const handleLogout = () => {
        dispatch(logoutThunk());
    };
    if (!user)
        return null;
    const avatarSource = user.avatar && !avatarLoadFailed
        ? { uri: user.avatar }
        : require("../../../../assets/visual/avt.png");
    return (<SafeAreaView className="flex-1 bg-page">
      <View className="px-6 pb-2 pt-4">
        <Text className="text-2xl font-extrabold text-slate-900">Cá nhân</Text>
      </View>

      <ScrollView contentContainerStyle={layoutContainer} contentContainerClassName="px-6 pb-8 pt-4">
        {/* User Info Card */}
        <View className="mb-6 flex-row items-center rounded-2xl border border-slate-100 bg-white p-5" style={shadowCard}>
          <Image source={avatarSource} onError={() => {
            if (user.avatar) {
                setAvatarLoadFailed(true);
            }
        }} className="h-16 w-16 rounded-full bg-slate-100"/>

          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-slate-900">
              {user.name || "Người dùng"}
            </Text>
            <Text className="mt-1 text-sm font-medium text-slate-500">
              {user.phone}
            </Text>
            <View className="mt-2 self-start rounded bg-slate-100 px-2.5 py-1">
              <Text className="text-xs font-bold text-slate-600 uppercase">
                {user.role}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        {!isAdmin && (<View className="mb-6 rounded-2xl border border-slate-100 bg-white px-4" style={shadowCard}>
            <MenuRow icon={PencilSimple} label="Chỉnh sửa thông tin" onPress={() => navigation.navigate("EditProfile")}/>
            {user.hasPassword && (<MenuRow icon={LockKey} label="Đổi mật khẩu" onPress={() => navigation.navigate("ChangePassword")}/>)}
          </View>)}

        {/* Logout */}
        <View className="rounded-2xl border border-slate-100 bg-white px-4" style={shadowCard}>
          <MenuRow icon={SignOut} label="Đăng xuất" onPress={handleLogout} color="#DC2626" hideArrow/>
        </View>
      </ScrollView>
    </SafeAreaView>);
}
