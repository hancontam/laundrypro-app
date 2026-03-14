// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer from "@/features/auth/authSlice";
import ordersReducer from "@/features/orders/ordersSlice";
import servicesReducer from "@/features/services/servicesSlice";
import usersReducer from "@/features/users/usersSlice";
import customersReducer from "@/features/customers/customersSlice";
import profileReducer from "@/features/profile/profileSlice";
import contactReducer from "@/features/contact/contactSlice";
import paymentReducer from "@/features/payments/paymentSlice";
import customerPaymentsReducer from "@/features/customerPayments/customerPaymentsSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    services: servicesReducer,
    users: usersReducer,
    customers: customersReducer,
    profile: profileReducer,
    contact: contactReducer,
    payments: paymentReducer,
    customerPayments: customerPaymentsReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/loginWithOtp/fulfilled",
          "auth/loginWithPassword/fulfilled",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
