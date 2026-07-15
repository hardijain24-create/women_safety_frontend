import React, { useState, useContext, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Input } from '../components/atoms/Input';
import { Icon } from '../components/atoms/Icon';
import { Loader } from '../components/atoms/Loader';
import { Card } from '../components/molecules/Card';
import { ScreenLayout } from '../components/organisms/Header';
import { ROUTES } from '../constants';
import { AuthStackParamList } from '../navigation';
import { AuthContext } from '../context/AuthContext';

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, typeof ROUTES.LOGIN>;

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<LoginNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const { login, isLoading: authLoading } = useContext(AuthContext);
  
  const isLoading = authLoading || localLoading;

  // Reanimated values for staggered entrance animations
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(40);

  useEffect(() => {
    // Entrance Animations
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withTiming(1, { duration: 600 });
    
    cardOpacity.value = withDelay(150, withTiming(1, { duration: 600 }));
    cardTranslateY.value = withDelay(150, withTiming(0, { duration: 600 }));
  }, [logoOpacity, logoScale, cardOpacity, cardTranslateY]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const handleLogin = async () => {
    Keyboard.dismiss();
    let hasError = false;
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setLocalLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigation.navigate(ROUTES.REGISTER);
  };

  const isFormValid = email.trim().length > 0 && password.length >= 6;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessibilityRole="none">
      <View style={{ flex: 1 }}>
        {/* Soft Premium Gradient Background */}
        <LinearGradient
          colors={theme.isDark ? ['#0E110F', '#161B18'] : ['#FFFFFF', '#F3F4F6']}
          style={StyleSheet.absoluteFillObject}
        />

        <ScreenLayout scrollable={true} safeArea={true} style={{ backgroundColor: 'transparent' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <View style={{ paddingHorizontal: 4, paddingVertical: 24 }}>
              
              {/* Logo Area */}
              <Animated.View style={[{ alignItems: 'center', marginBottom: 32 }, logoAnimatedStyle]}>
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: theme.colors.primary + '15', // pastel green/lilac tint
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Icon name="shield" size={48} color={theme.colors.primaryDark} />
                </View>
                <Typography variant="h1" color="primary" align="center" weight="700">
                  Guardian Band
                </Typography>
                <Typography variant="body" color="muted" align="center" style={{ marginTop: 4 }}>
                  Your calming safety companion
                </Typography>
              </Animated.View>

              {/* Form Card */}
              <Animated.View style={cardAnimatedStyle}>
                <Card variant="glass" padding="large" style={{ marginBottom: 24 }}>
                  <Typography variant="h3" color="primary" weight="700" style={{ marginBottom: 20 }}>
                    Welcome Back
                  </Typography>

                  {/* Form Fields */}
                  <View style={{ marginBottom: 12 }}>
                    <Input
                      label="Email Address"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={emailError}
                      variant="outlined"
                      height="hero"
                      leftIcon={<Icon name="email" size={20} color={theme.colors.textMuted} />}
                    />
                    
                    <Input
                      label="Password"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError('');
                      }}
                      placeholder="Enter your password"
                      secureTextEntry
                      error={passwordError}
                      variant="outlined"
                      height="hero"
                      leftIcon={<Icon name="settings" size={20} color={theme.colors.textMuted} />}
                    />
                  </View>

                  {/* Remember Me & Forgot Password */}
                  <View 
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 20,
                    }}
                  >
                    <TouchableOpacity 
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setRememberMe(!rememberMe);
                      }}
                      activeOpacity={0.7}
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      accessibilityLabel="Remember my login credentials"
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: rememberMe }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          borderWidth: 1.5,
                          borderColor: rememberMe ? theme.colors.primary : theme.colors.border,
                          backgroundColor: rememberMe ? theme.colors.primary : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 8,
                        }}
                      >
                        {rememberMe && <Icon name="check" size={14} color={theme.colors.textInverse} />}
                      </View>
                      <Typography variant="bodySmall" color="secondary">
                        Remember me
                      </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      activeOpacity={0.7}
                      accessibilityLabel="Retrieve forgotten password"
                      accessibilityRole="button"
                      onPress={() => Alert.alert("Reset Password", "A password reset link will be sent to your registered email address.")}
                    >
                      <Typography variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                        Forgot Password?
                      </Typography>
                    </TouchableOpacity>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ gap: 12 }}>
                    <Button
                      title="Sign In"
                      onPress={handleLogin}
                      variant="primary"
                      size="xlarge"
                      loading={isLoading}
                      disabled={!isFormValid || isLoading}
                      fullWidth={true}
                    />

                    <Button
                      title="Create New Account"
                      onPress={handleRegister}
                      variant="ghost"
                      size="large"
                      fullWidth={true}
                    />
                  </View>

                  {/* Biometrics Placeholder */}
                  <View style={{ alignItems: 'center', marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderColor: theme.colors.borderLight }}>
                    <Typography variant="caption" color="muted" style={{ marginBottom: 12 }}>
                      Or sign in using face or fingerprint
                    </Typography>
                    <TouchableOpacity 
                      activeOpacity={0.6}
                      onPress={() => Alert.alert("Biometrics Not Enabled", "Please sign in with email and password first, then enable biometrics in settings.")}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: theme.colors.backgroundSecondary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        opacity: 0.5,
                      }}
                      accessibilityLabel="Sign in with biometrics (currently unavailable)"
                      accessibilityRole="button"
                      accessibilityState={{ disabled: true }}
                    >
                      <Icon name="shield" size={26} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </Card>
              </Animated.View>

              {/* Version Info */}
              <Typography variant="caption" color="muted" align="center" style={{ marginTop: 8 }}>
                Guardian Band • v1.0.2 Build 2026
              </Typography>
            </View>
          </KeyboardAvoidingView>
        </ScreenLayout>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Card variant="glass" padding="large" style={{ alignItems: 'center' }}>
              <Loader text="Signing in secure session..." />
            </Card>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
