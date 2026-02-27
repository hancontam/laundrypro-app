// src/app/navigation.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConfirmationResult } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignOut, User, ClipboardText, Broom, UsersThree } from 'phosphor-react-native';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useAppSelector, useAppDispatch } from './store';
import { logoutThunk } from '@/features/auth/authSlice';
import {
  Colors,
  shadowCard,
  shadowOutline,
  pressedStyle,
  pressedStyleSmall,
  layoutContainer,
  labelStyle,
} from '@/theme/tokens';

// Auth screens
import LoginScreen from '@/features/auth/screens/LoginScreen';
import OtpScreen from '@/features/auth/screens/OtpScreen';
import SetPasswordScreen from '@/features/auth/screens/SetPasswordScreen';

// Orders screens
import OrderListScreen from '@/features/orders/screens/OrderListScreen';
import OrderDetailScreen from '@/features/orders/screens/OrderDetailScreen';
import CreateOrderScreen from '@/features/orders/screens/CreateOrderScreen';

// Services screens
import ServiceListScreen from '@/features/services/screens/ServiceListScreen';
import ServiceDetailScreen from '@/features/services/screens/ServiceDetailScreen';
import ServiceFormScreen from '@/features/services/screens/ServiceFormScreen';

// Users screens (Admin only)
import StaffListScreen from '@/features/users/screens/StaffListScreen';
import StaffDetailScreen from '@/features/users/screens/StaffDetailScreen';
import CreateStaffScreen from '@/features/users/screens/CreateStaffScreen';
import EditStaffScreen from '@/features/users/screens/EditStaffScreen';

// Profile screens (All users)
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';
import ChangePasswordScreen from '@/features/profile/screens/ChangePasswordScreen';

// Customers screens (Admin & Staff)
import CustomerListScreen from '@/features/customers/screens/CustomerListScreen';
import CustomerDetailScreen from '@/features/customers/screens/CustomerDetailScreen';
import CustomerFormScreen from '@/features/customers/screens/CustomerFormScreen';

// ─── Param lists ────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Otp: { phone: string; confirmation: ConfirmationResult };
  SetPassword: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  OrderList: undefined;
  OrderDetail: { orderId: string };
  CreateOrder: undefined;
  ServiceList: undefined;
  ServiceDetail: { serviceId: string };
  ServiceForm: { serviceId?: string } | undefined;
  StaffList: undefined;
  StaffDetail: { userId: string };
  CreateStaff: undefined;
  EditStaff: { staffId: string };
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
  CustomerForm: { customerId?: string } | undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// ─── §5.1 Info Row ──────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-slate-400" style={labelStyle}>
        {label}
      </Text>
      <Text className="text-sm font-semibold capitalize text-slate-700">
        {value}
      </Text>
    </View>
  );
}

// ─── HomeScreen ─────────────────────────────────────────────────
function HomeScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    dispatch(logoutThunk());
  };

  return (
    <SafeAreaView className="flex-1 bg-page">
      <View className="flex-1 items-center justify-center px-6" style={layoutContainer}>
        {/* §5.1 Card with shadow-sm + rounded-2xl */}
        <View
          className="mb-6 w-full rounded-2xl border border-slate-100 bg-white p-6"
          style={shadowCard}
        >
          <View className="mb-4 items-center">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <User size={32} color={Colors.indigo600} weight="bold" />
            </View>
            <Text className="text-lg font-extrabold text-slate-900">
              {user?.name || 'Chưa cập nhật tên'}
            </Text>
            <Text className="mt-1 text-sm font-medium text-slate-500">
              {user?.phone}
            </Text>
          </View>

          <InfoRow label="VAI TRÒ" value={user?.role || '—'} />
          <InfoRow label="TRẠNG THÁI" value={user?.status || '—'} />
          <InfoRow
            label="XÁC THỰC"
            value={user?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
          />
        </View>

        {/* Navigation buttons */}
        <View className="w-full gap-3">
          {/* Orders */}
          <Pressable
            onPress={() => navigation.navigate('OrderList')}
            className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5"
            style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}
          >
            <ClipboardText size={20} color={Colors.slate700} weight="bold" />
            <Text className="text-sm font-bold text-slate-700">Đơn hàng</Text>
          </Pressable>

          {/* Services */}
          <Pressable
            onPress={() => navigation.navigate('ServiceList')}
            className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5"
            style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}
          >
            <Broom size={20} color={Colors.slate700} weight="bold" />
            <Text className="text-sm font-bold text-slate-700">Dịch vụ</Text>
          </Pressable>

          {/* Users & Customers — Admin only */}
          {isAdmin && (
            <>
              <Pressable
                onPress={() => navigation.navigate('CustomerList')}
                className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5"
                style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}
              >
                <UsersThree size={20} color={Colors.slate700} weight="bold" />
                <Text className="text-sm font-bold text-slate-700">Khách hàng</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('StaffList')}
                className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5"
                style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}
              >
                <UsersThree size={20} color={Colors.slate700} weight="bold" />
                <Text className="text-sm font-bold text-slate-700">Nhân viên</Text>
              </Pressable>
            </>
          )}

          {/* Profile */}
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5"
            style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}
          >
            <User size={20} color={Colors.slate700} weight="bold" />
            <Text className="text-sm font-bold text-slate-700">Cá nhân</Text>
          </Pressable>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 px-6 py-3.5"
            style={({ pressed }) => [shadowOutline, pressedStyleSmall(pressed)]}
          >
            <SignOut size={20} color="#DC2626" weight="bold" />
            <Text className="text-sm font-bold text-red-600">Đăng xuất</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Auth Navigator ─────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.page },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
      <AuthStack.Screen name="SetPassword" component={SetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Main Navigator ─────────────────────────────────────────────
function MainNavigator() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.page },
      }}
    >
      {/* Common Screens */}
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="OrderList" component={OrderListScreen} />
      <MainStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
      <MainStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <MainStack.Screen name="ServiceList" component={ServiceListScreen} />
      <MainStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />

      {/* Staff & Admin Only */}
      {isStaffOrAdmin && (
        <>
          <MainStack.Screen name="CreateOrder" component={CreateOrderScreen} />
          <MainStack.Screen name="ServiceForm" component={ServiceFormScreen} />
        </>
      )}

      {/* Admin Only */}
      {isAdmin && (
        <>
          <MainStack.Screen name="CustomerList" component={CustomerListScreen} />
          <MainStack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
          <MainStack.Screen name="CustomerForm" component={CustomerFormScreen} />
          <MainStack.Screen name="StaffList" component={StaffListScreen} />
          <MainStack.Screen name="StaffDetail" component={StaffDetailScreen} />
          <MainStack.Screen name="CreateStaff" component={CreateStaffScreen} />
          <MainStack.Screen name="EditStaff" component={EditStaffScreen} />
        </>
      )}
    </MainStack.Navigator>
  );
}

// ─── Root Navigator ─────────────────────────────────────────────
export default function AppNavigator() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user && !user.hasPassword ? (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="SetPassword" component={SetPasswordScreen} />
        </AuthStack.Navigator>
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
