// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from '@/features/auth/authSlice';
import ordersReducer from '@/features/orders/ordersSlice';
import servicesReducer from '@/features/services/servicesSlice';
import usersReducer from '@/features/users/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    services: servicesReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginWithOtp/fulfilled', 'auth/loginWithPassword/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
