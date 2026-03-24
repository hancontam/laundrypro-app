import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, Eye, EyeSlash, LockSimple, ShieldCheck } from 'phosphor-react-native';
import auth from '@react-native-firebase/auth';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { clearError, resetPasswordWithOtpThunk } from '../authSlice';
import { Colors, layoutContainer, labelStyle, pressedStyle, pressedStyleSmall, shadowCTA, shadowCard, shadowFloating, } from '@/theme/tokens';
const OTP_LENGTH = 6;
function getOtpErrorMessage(error) {
    const code = error?.code;
    if (code === 'auth/invalid-verification-code') {
        return 'Mã OTP không đúng. Vui lòng kiểm tra và nhập lại.';
    }
    if (code === 'auth/code-expired') {
        return 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
    }
    return 'Không thể xác thực OTP. Vui lòng thử lại.';
}
export default function ForgotPasswordOtpScreen({ navigation, route, }) {
    const { phone, confirmation } = route.params;
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [verifiedIdToken, setVerifiedIdToken] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const inputRefs = useRef([]);
    const minLength = password.length >= 8;
    const hasMatch = password === confirmPassword && confirmPassword.length > 0;
    const isValidPassword = minLength && hasMatch;
    const isVerifyingOtp = localLoading && !verifiedIdToken;
    const isSubmittingPassword = isLoading;
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);
    const cardTitle = useMemo(() => (verifiedIdToken ? 'Đặt lại mật khẩu' : 'Xác thực OTP'), [verifiedIdToken]);
    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (localError) {
            setLocalError(null);
        }
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
        }
    };
    const handleVerifyOtp = useCallback(async () => {
        const code = otp.join('');
        if (code.length !== OTP_LENGTH || verifiedIdToken)
            return;
        dispatch(clearError());
        setLocalError(null);
        setLocalLoading(true);
        try {
            await confirmation.confirm(code);
            const user = auth().currentUser;
            if (!user) {
                throw new Error('Không thể lấy thông tin xác thực OTP.');
            }
            const idToken = await user.getIdToken();
            setVerifiedIdToken(idToken);
            setOtp(Array(OTP_LENGTH).fill(''));
            await auth().signOut();
        }
        catch (err) {
            setLocalError(getOtpErrorMessage(err));
        }
        finally {
            setLocalLoading(false);
        }
    }, [confirmation, dispatch, otp, verifiedIdToken]);
    const handleResetPassword = useCallback(async () => {
        if (!verifiedIdToken || !isValidPassword)
            return;
        dispatch(clearError());
        const result = await dispatch(resetPasswordWithOtpThunk({
            idToken: verifiedIdToken,
            newPassword: password,
        }));
        if (resetPasswordWithOtpThunk.fulfilled.match(result)) {
            Alert.alert('Đặt lại mật khẩu thành công', 'Bạn có thể đăng nhập lại bằng mật khẩu mới.', [
                {
                    text: 'Đăng nhập',
                    onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
                },
            ]);
        }
    }, [dispatch, isValidPassword, navigation, password, verifiedIdToken]);
    return (<SafeAreaView className="flex-1 bg-page">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => navigation.goBack()} className="h-10 w-10 items-center justify-center rounded-xl bg-white" style={({ pressed }) => [shadowFloating, pressedStyleSmall(pressed)]}>
            <ArrowLeft size={20} color={Colors.slate700} weight="bold"/>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={layoutContainer} contentContainerClassName="flex-grow justify-center px-6 pb-8" keyboardShouldPersistTaps="handled">
          <View className="mb-6 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              {verifiedIdToken ? (<LockSimple size={32} color={Colors.indigo600} weight="bold"/>) : (<ShieldCheck size={32} color={Colors.indigo600} weight="bold"/>)}
            </View>
            <Text className="text-xl font-extrabold text-slate-900">{cardTitle}</Text>
            <Text className="mt-2 text-center text-sm font-medium text-slate-500">
              {verifiedIdToken
            ? 'Số điện thoại đã được xác thực. Hãy đặt mật khẩu mới cho tài khoản.'
            : `Mã xác thực đã được gửi đến\n${phone}`}
            </Text>
          </View>

          {(localError || error) && (<View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-600">{localError || error}</Text>
            </View>)}

          {!verifiedIdToken ? (<>
              <View className="mb-8 flex-row justify-center gap-3">
                {otp.map((digit, index) => (<TextInput key={index} ref={(ref) => {
                    inputRefs.current[index] = ref;
                }} style={{
                    height: 56,
                    width: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: digit ? Colors.indigo500 : Colors.slate200,
                    backgroundColor: digit ? Colors.indigo50 : Colors.slate50,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: '700',
                    color: Colors.slate900,
                }} maxLength={1} keyboardType="number-pad" value={digit} onChangeText={(value) => handleOtpChange(value, index)} onKeyPress={(e) => handleKeyPress(e, index)} selectTextOnFocus autoFocus={index === 0}/>))}
              </View>

              <Pressable onPress={handleVerifyOtp} disabled={isVerifyingOtp || otp.some((digit) => !digit)} className="flex-row items-center justify-center rounded-xl bg-indigo-600 py-4" style={({ pressed }) => [
                shadowCTA,
                pressedStyle(pressed),
                { opacity: isVerifyingOtp || otp.some((digit) => !digit) ? 0.5 : 1 },
            ]}>
                {isVerifyingOtp ? (<ActivityIndicator color="#fff"/>) : (<Text className="text-base font-bold text-white">Xác nhận OTP</Text>)}
              </Pressable>
            </>) : (<>
              <View className="mb-5 flex-row items-center rounded-2xl border border-green-100 bg-green-50 px-4 py-3" style={shadowCard}>
                <CheckCircle size={20} color={Colors.green500} weight="fill"/>
                <Text className="ml-3 flex-1 text-sm font-semibold text-green-700">
                  Số điện thoại đã xác thực thành công.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="mb-2 text-slate-500" style={labelStyle}>
                  MẬT KHẨU MỚI
                </Text>
                <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <LockSimple size={20} color={Colors.slate400} weight="bold"/>
                  <TextInput className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900" placeholder="Tối thiểu 8 ký tự" placeholderTextColor={Colors.slate300} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} autoFocus/>
                  <Pressable onPress={() => setShowPassword(!showPassword)} className="p-1">
                    {showPassword ? (<EyeSlash size={20} color={Colors.slate400} weight="bold"/>) : (<Eye size={20} color={Colors.slate400} weight="bold"/>)}
                  </Pressable>
                </View>
              </View>

              <View className="mb-6">
                <Text className="mb-2 text-slate-500" style={labelStyle}>
                  XÁC NHẬN MẬT KHẨU MỚI
                </Text>
                <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <LockSimple size={20} color={Colors.slate400} weight="bold"/>
                  <TextInput className="ml-3 flex-1 py-3.5 text-base font-semibold text-slate-900" placeholder="Nhập lại mật khẩu mới" placeholderTextColor={Colors.slate300} secureTextEntry={!showConfirm} value={confirmPassword} onChangeText={setConfirmPassword}/>
                  <Pressable onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                    {showConfirm ? (<EyeSlash size={20} color={Colors.slate400} weight="bold"/>) : (<Eye size={20} color={Colors.slate400} weight="bold"/>)}
                  </Pressable>
                </View>
              </View>

              <View className="mb-8 rounded-2xl border border-slate-100 bg-white p-4" style={shadowCard}>
                <ValidationRow label="Tối thiểu 8 ký tự" isValid={minLength}/>
                <ValidationRow label="Mật khẩu khớp nhau" isValid={hasMatch}/>
              </View>

              <Pressable onPress={handleResetPassword} disabled={isSubmittingPassword || !isValidPassword} className="flex-row items-center justify-center rounded-xl bg-indigo-600 py-4" style={({ pressed }) => [
                shadowCTA,
                pressedStyle(pressed),
                { opacity: isSubmittingPassword || !isValidPassword ? 0.5 : 1 },
            ]}>
                {isSubmittingPassword ? (<ActivityIndicator color="#fff"/>) : (<Text className="text-base font-bold text-white">
                    Cập nhật mật khẩu
                  </Text>)}
              </Pressable>
            </>)}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>);
}
function ValidationRow({ label, isValid }) {
    return (<View className="mb-2 flex-row items-center">
      <CheckCircle size={18} color={isValid ? Colors.green500 : Colors.slate300} weight={isValid ? 'fill' : 'bold'}/>
      <Text className={`ml-2 text-sm font-medium ${isValid ? 'text-green-600' : 'text-slate-400'}`}>
        {label}
      </Text>
    </View>);
}

