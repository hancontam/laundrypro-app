import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { NavigationContainer, getFocusedRouteNameFromRoute, } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { House, ClipboardText, Broom, UsersThree, User, CreditCard, ChartBar, Plus, CaretRight, } from "phosphor-react-native";
import { useAppSelector } from "./store";
import { Colors, shadowCard, shadowFloating, pressedStyle, layoutContainer, labelStyle, } from "@/theme/tokens";
import LoginScreen from "@/features/auth/screens/LoginScreen";
import OtpScreen from "@/features/auth/screens/OtpScreen";
import SetPasswordScreen from "@/features/auth/screens/SetPasswordScreen";
import ForgotPasswordScreen from "@/features/auth/screens/ForgotPasswordScreen";
import ForgotPasswordOtpScreen from "@/features/auth/screens/ForgotPasswordOtpScreen";
import GuestHomeScreen from "@/features/guest/screens/GuestHomeScreen";
import ContactUsScreen from "@/features/contact/screens/ContactUsScreen";
import OrderListScreen from "@/features/orders/screens/OrderListScreen";
import OrderDetailScreen from "@/features/orders/screens/OrderDetailScreen";
import CreateOrderScreen from "@/features/orders/screens/CreateOrderScreen";
import CreatePaymentScreen from "@/features/payments/screens/CreatePaymentScreen";
import PaymentHistoryScreen from "@/features/customerPayments/screens/PaymentHistoryScreen";
import PaymentDetailScreen from "@/features/customerPayments/screens/PaymentDetailScreen";
import ServiceListScreen from "@/features/services/screens/ServiceListScreen";
import ServiceDetailScreen from "@/features/services/screens/ServiceDetailScreen";
import ServiceFormScreen from "@/features/services/screens/ServiceFormScreen";
import StaffListScreen from "@/features/users/screens/StaffListScreen";
import StaffDetailScreen from "@/features/users/screens/StaffDetailScreen";
import CreateStaffScreen from "@/features/users/screens/CreateStaffScreen";
import EditStaffScreen from "@/features/users/screens/EditStaffScreen";
import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import EditProfileScreen from "@/features/profile/screens/EditProfileScreen";
import ChangePasswordScreen from "@/features/profile/screens/ChangePasswordScreen";
import CustomerListScreen from "@/features/customers/screens/CustomerListScreen";
import CustomerDetailScreen from "@/features/customers/screens/CustomerDetailScreen";
import CustomerFormScreen from "@/features/customers/screens/CustomerFormScreen";
import DashboardScreen from "@/features/dashboard/screens/DashboardScreen";
import ContactRequestListScreen from "@/features/contact/screens/ContactRequestListScreen";
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const ServicesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const ManageStack = createNativeStackNavigator();
const sharedStackOptions = {
    headerShown: false,
    animation: "slide_from_right",
    contentStyle: { backgroundColor: Colors.page },
};
const baseTabBarStyle = {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 76,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    borderRadius: 24,
    shadowColor: Colors.slate900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
};
function resolveTabBarStyle(route, hiddenRoutes) {
    const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? "";
    if (hiddenRoutes.includes(focusedRouteName)) {
        return { ...baseTabBarStyle, display: "none" };
    }
    return baseTabBarStyle;
}
function TabItem({ icon: Icon, label, focused, }) {
    return (<View className="items-center justify-center gap-1">
      <View className={`h-10 w-10 items-center justify-center rounded-2xl ${focused ? "bg-indigo-50" : "bg-transparent"}`}>
        <Icon size={20} color={focused ? Colors.indigo600 : Colors.slate400} weight={focused ? "fill" : "bold"}/>
      </View>
      <Text className={`text-[11px] font-bold ${focused ? "text-indigo-600" : "text-slate-400"}`}>
        {label}
      </Text>
    </View>);
}
function SectionTitle({ title }) {
    return (<Text className="mb-3 text-slate-500" style={labelStyle}>
      {title}
    </Text>);
}
function ShortcutCard({ icon: Icon, title, subtitle, onPress, }) {
    return (<Pressable onPress={onPress} className="rounded-2xl border border-slate-100 bg-white p-4" style={({ pressed }) => [
            shadowCard,
            pressedStyle(pressed),
            { width: "48%" },
        ]}>
      <View className="mb-4 h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
        <Icon size={22} color={Colors.indigo600} weight="bold"/>
      </View>
      <Text className="text-sm font-extrabold text-slate-900">{title}</Text>
      <Text className="mt-1 text-xs font-medium leading-5 text-slate-500">
        {subtitle}
      </Text>
    </Pressable>);
}
function ManageRow({ icon: Icon, title, description, onPress, }) {
    return (<Pressable onPress={onPress} className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4" style={({ pressed }) => [shadowCard, pressedStyle(pressed)]}>
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
        <Icon size={22} color={Colors.indigo600} weight="bold"/>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-extrabold text-slate-900">{title}</Text>
        <Text className="mt-1 text-xs font-medium leading-5 text-slate-500">
          {description}
        </Text>
      </View>
      <CaretRight size={18} color={Colors.slate400} weight="bold"/>
    </Pressable>);
}
function HomeScreen({ navigation }) {
    const { user } = useAppSelector((state) => state.auth);
    const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";
    return (<SafeAreaView className="flex-1 bg-page">
      <ScrollView contentContainerStyle={layoutContainer} contentContainerClassName="px-6 pb-28 pt-4" showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.indigo600, Colors.indigo500]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="mb-6 rounded-[28px] px-5 py-6" style={shadowFloating}>
          <Text className="text-sm font-semibold text-indigo-100">
            LaundryPro
          </Text>
          <Text className="mt-2 text-2xl font-extrabold text-white">
            {user?.name || "Xin chào"}
          </Text>
          <Text className="mt-2 text-sm font-medium leading-6 text-indigo-100">
            {user?.phone || "Chưa cập nhật số điện thoại"}
          </Text>

          <View className="mt-5 self-start rounded-full bg-white/15 px-3 py-1.5">
            <Text className="text-xs font-bold uppercase tracking-[1px] text-white">
              {user?.role || "user"}
            </Text>
          </View>
        </LinearGradient>

        <SectionTitle title="LỐI TẮT"/>
        <View className="mb-6 flex-row flex-wrap justify-between gap-y-3">
          <ShortcutCard icon={ClipboardText} title="Đơn hàng" subtitle="Xem danh sách đơn và theo dõi thanh toán." onPress={() => navigation.navigate("OrdersTab")}/>
          <ShortcutCard icon={Broom} title="Dịch vụ" subtitle="Xem bảng giá và quản lý danh mục dịch vụ." onPress={() => navigation.navigate("ServicesTab")}/>

          {isStaffOrAdmin && (<ShortcutCard icon={Plus} title="Tạo đơn mới" subtitle="Khởi tạo đơn giặt sấy và thu tiền nhanh hơn." onPress={() => navigation.navigate("OrdersTab", { screen: "CreateOrder" })}/>)}

          {isStaffOrAdmin && (<ShortcutCard icon={UsersThree} title="Quản trị" subtitle="Khách hàng, thanh toán và các công cụ quản lý phù hợp với quyền của bạn." onPress={() => navigation.navigate("ManageTab")}/>)}

          <ShortcutCard icon={User} title="Tài khoản" subtitle="Cập nhật thông tin cá nhân và tùy chọn bảo mật." onPress={() => navigation.navigate("ProfileTab")}/>
        </View>

        <View className="rounded-2xl border border-slate-100 bg-white p-5" style={shadowCard}>
          <SectionTitle title="TRẠNG THÁI HỆ THỐNG"/>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-sm font-medium text-slate-500">Vai trò</Text>
            <Text className="text-sm font-bold capitalize text-slate-800">
              {user?.role || "-"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-sm font-medium text-slate-500">Trạng thái</Text>
            <Text className="text-sm font-bold capitalize text-slate-800">
              {user?.status || "-"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-sm font-medium text-slate-500">Xác thực</Text>
            <Text className="text-sm font-bold text-slate-800">
              {user?.isVerified ? "Đã xác thực" : "Chưa xác thực"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>);
}
function ManageHubScreen({ navigation }) {
    const role = useAppSelector((state) => state.auth.user?.role);
    const manageItems = [
        {
            key: "dashboard",
            icon: ChartBar,
            title: "Thống kê",
            description: "Theo dõi doanh thu, đơn hàng và tổng quan hoạt động.",
            screen: "Dashboard",
            roles: ["admin"],
        },
        {
            key: "customers",
            icon: UsersThree,
            title: "Khách hàng",
            description: "Xem danh sách, chi tiết và cập nhật hồ sơ khách hàng.",
            screen: "CustomerList",
            roles: ["admin", "staff"],
        },
        {
            key: "staff",
            icon: User,
            title: "Nhân viên",
            description: "Quản lý tài khoản nhân viên và quyền truy cập.",
            screen: "StaffList",
            roles: ["admin"],
        },
        {
            key: "payment-history",
            icon: CreditCard,
            title: "Lịch sử thanh toán",
            description: "Xem toàn bộ giao dịch thanh toán của khách hàng.",
            screen: "PaymentHistory",
            roles: ["admin", "staff"],
        },
        {
            key: "contact-requests",
            icon: ClipboardText,
            title: "Yêu cầu liên hệ",
            description: "Theo dõi phản hồi và yêu cầu mới từ khách hàng.",
            screen: "ContactRequestList",
            roles: ["admin"],
        },
    ];
    const visibleManageItems = manageItems.filter((item) => item.roles.includes(role));
    return (<SafeAreaView className="flex-1 bg-page">
      <ScrollView contentContainerStyle={layoutContainer} contentContainerClassName="px-6 pb-28 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-2xl font-extrabold text-slate-900">
            Quản trị
          </Text>
          <Text className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Điều hướng nhanh đến các khu vực quản lý quan trọng của hệ thống.
          </Text>
        </View>

        {visibleManageItems.map((item) => (<ManageRow key={item.key} icon={item.icon} title={item.title} description={item.description} onPress={() => navigation.navigate(item.screen)}/>))}
      </ScrollView>
    </SafeAreaView>);
}
function AuthNavigator() {
    return (<AuthStack.Navigator initialRouteName="GuestHome" screenOptions={sharedStackOptions}>
      <AuthStack.Screen name="GuestHome" component={GuestHomeScreen}/>
      <AuthStack.Screen name="ContactUs" component={ContactUsScreen}/>
      <AuthStack.Screen name="Login" component={LoginScreen}/>
      <AuthStack.Screen name="Otp" component={OtpScreen}/>
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
      <AuthStack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtpScreen}/>
      <AuthStack.Screen name="SetPassword" component={SetPasswordScreen}/>
    </AuthStack.Navigator>);
}
function HomeNavigator() {
    return (<HomeStack.Navigator screenOptions={sharedStackOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen}/>
    </HomeStack.Navigator>);
}
function OrdersNavigator() {
    const { user } = useAppSelector((state) => state.auth);
    const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";
    return (<OrdersStack.Navigator screenOptions={sharedStackOptions}>
      <OrdersStack.Screen name="OrderList" component={OrderListScreen}/>
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen}/>
      {isStaffOrAdmin && (<>
          <OrdersStack.Screen name="CreateOrder" component={CreateOrderScreen}/>
          <OrdersStack.Screen name="CreatePayment" component={CreatePaymentScreen}/>
        </>)}
    </OrdersStack.Navigator>);
}
function ServicesNavigator() {
    const { user } = useAppSelector((state) => state.auth);
    const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";
    return (<ServicesStack.Navigator screenOptions={sharedStackOptions}>
      <ServicesStack.Screen name="ServiceList" component={ServiceListScreen}/>
      <ServicesStack.Screen name="ServiceDetail" component={ServiceDetailScreen}/>
      {isStaffOrAdmin && (<ServicesStack.Screen name="ServiceForm" component={ServiceFormScreen}/>)}
    </ServicesStack.Navigator>);
}
function ProfileNavigator() {
    const role = useAppSelector((state) => state.auth.user?.role);
    const canManageOwnProfile = role !== "admin";
    return (<ProfileStack.Navigator screenOptions={sharedStackOptions}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen}/>
      {canManageOwnProfile && (<>
          <ProfileStack.Screen name="EditProfile" component={EditProfileScreen}/>
          <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen}/>
        </>)}
    </ProfileStack.Navigator>);
}
function ManageNavigator() {
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "admin";
    const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";
    return (<ManageStack.Navigator screenOptions={sharedStackOptions}>
      <ManageStack.Screen name="ManageHub" component={ManageHubScreen}/>
      {isAdmin && (<ManageStack.Screen name="Dashboard" component={DashboardScreen}/>)}
      {isStaffOrAdmin && (<>
          <ManageStack.Screen name="CustomerList" component={CustomerListScreen}/>
          <ManageStack.Screen name="CustomerDetail" component={CustomerDetailScreen}/>
          <ManageStack.Screen name="CustomerForm" component={CustomerFormScreen}/>
          <ManageStack.Screen name="PaymentHistory" component={PaymentHistoryScreen} initialParams={{ scope: "all" }}/>
          <ManageStack.Screen name="PaymentDetail" component={PaymentDetailScreen}/>
        </>)}
      {isAdmin && (<>
          <ManageStack.Screen name="StaffList" component={StaffListScreen}/>
          <ManageStack.Screen name="StaffDetail" component={StaffDetailScreen}/>
          <ManageStack.Screen name="CreateStaff" component={CreateStaffScreen}/>
          <ManageStack.Screen name="EditStaff" component={EditStaffScreen}/>
          <ManageStack.Screen name="ContactRequestList" component={ContactRequestListScreen}/>
        </>)}
    </ManageStack.Navigator>);
}
function MainTabsNavigator() {
    const { user } = useAppSelector((state) => state.auth);
    const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";
    return (<Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarHideOnKeyboard: true,
            tabBarStyle: baseTabBarStyle,
        }}>
      <Tab.Screen name="HomeTab" component={HomeNavigator} options={{
            tabBarIcon: ({ focused }) => (<TabItem icon={House} label="Trang chủ" focused={focused}/>),
        }}/>
      <Tab.Screen name="OrdersTab" component={OrdersNavigator} options={({ route }) => ({
            tabBarIcon: ({ focused }) => (<TabItem icon={ClipboardText} label="Đơn hàng" focused={focused}/>),
            tabBarStyle: resolveTabBarStyle(route, [
                "OrderDetail",
                "CreateOrder",
                "CreatePayment",
            ]),
        })}/>
      <Tab.Screen name="ServicesTab" component={ServicesNavigator} options={({ route }) => ({
            tabBarIcon: ({ focused }) => (<TabItem icon={Broom} label="Dịch vụ" focused={focused}/>),
            tabBarStyle: resolveTabBarStyle(route, ["ServiceDetail", "ServiceForm"]),
        })}/>

      {isStaffOrAdmin && (<Tab.Screen name="ManageTab" component={ManageNavigator} options={({ route }) => ({
                tabBarIcon: ({ focused }) => (<TabItem icon={UsersThree} label="Quản trị" focused={focused}/>),
                tabBarStyle: resolveTabBarStyle(route, [
                    "Dashboard",
                    "CustomerList",
                    "CustomerDetail",
                    "CustomerForm",
                    "StaffList",
                    "StaffDetail",
                    "CreateStaff",
                    "EditStaff",
                    "PaymentHistory",
                    "PaymentDetail",
                    "ContactRequestList",
                ]),
            })}/>)}

      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={({ route }) => ({
            tabBarIcon: ({ focused }) => (<TabItem icon={User} label="Cá nhân" focused={focused}/>),
            tabBarStyle: resolveTabBarStyle(route, ["EditProfile", "ChangePassword"]),
        })}/>
    </Tab.Navigator>);
}
export default function AppNavigator() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    return (<NavigationContainer>
      {!isAuthenticated ? (<AuthNavigator />) : user && !user.hasPassword ? (<AuthStack.Navigator screenOptions={sharedStackOptions}>
          <AuthStack.Screen name="SetPassword" component={SetPasswordScreen}/>
        </AuthStack.Navigator>) : (<MainTabsNavigator />)}
    </NavigationContainer>);
}
