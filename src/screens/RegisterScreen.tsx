import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard, AccessibilityInfo, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Input } from '../components/atoms/Input';
import { Icon } from '../components/atoms/Icon';
import { ProgressRing } from '../components/atoms/ProgressRing';
import { Loader } from '../components/atoms/Loader';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { AuthContext } from '../context/AuthContext';

export const RegisterScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const { register } = useContext(AuthContext);

  // Refs for keyboard navigation focus
  const nameRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  // Password criteria states
  const hasEightChars = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  // Dynamic Step Tracker
  const currentStep = 1;
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Reanimated values for staggered entrance
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(40);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      headerOpacity.value = 1;
      headerScale.value = 1;
      cardOpacity.value = 1;
      cardTranslateY.value = 0;
      return;
    }
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerScale.value = withTiming(1, { duration: 500 });
    cardOpacity.value = withDelay(100, withTiming(1, { duration: 550 }));
    cardTranslateY.value = withDelay(100, withTiming(0, { duration: 550 }));
  }, [headerOpacity, headerScale, cardOpacity, cardTranslateY, reduceMotion]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const handleRegister = async () => {
    Keyboard.dismiss();
    let hasError = false;

    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!hasEightChars || !hasNumber || !hasUppercase || !hasSymbol) {
      setPasswordError('Password must meet all checklist requirements');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsLoading(true);
    try {
      await register({ name, email, password });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequirement = (label: string, met: boolean) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon 
        name={met ? "check" : "close"} 
        size={13} 
        color={met ? theme.colors.success : theme.colors.textMuted} 
        containerStyle={{ width: 16, height: 16 }}
      />
      <Typography 
        variant="caption" 
        style={{ 
          color: met ? theme.colors.success : theme.colors.textMuted,
          fontWeight: met ? '600' : '400',
        }}
      >
        {label}
      </Typography>
    </View>
  );

  // Form validity for primary button state
  const isFormValid = 
    name.trim().length > 0 && 
    email.trim().length > 0 && 
    hasEightChars && hasNumber && hasUppercase && hasSymbol &&
    confirmPassword === password;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessibilityRole="none">
      <View style={{ flex: 1 }}>
        {/* Soft Background Gradient */}
        <LinearGradient
          colors={theme.isDark ? ['#0E110F', '#161B18'] : ['#FFFFFF', '#F3F4F6']}
          style={StyleSheet.absoluteFillObject}
        />

        <ScreenLayout
          header={
            <Header
              title="Create Account"
              onBack={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                navigation.goBack();
              }}
              transparent={true}
            />
          }
          scrollable={true}
          safeArea={true}
          style={{ backgroundColor: 'transparent' }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1, paddingHorizontal: 4, paddingTop: 12, paddingBottom: 24 }}>
              
              {/* Step Progress Tracker header */}
              <Animated.View style={[{ alignItems: 'center', marginBottom: 24 }, headerAnimatedStyle]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 10 }}>
                  <ProgressRing progress={progress} size={32} strokeWidth={3} showText={false} />
                  <Typography variant="caption" color="muted" weight="700">
                    STEP {currentStep} OF {totalSteps}: ACCOUNT CREDENTIALS
                  </Typography>
                </View>

                <Typography variant="body" color="muted" align="center" style={{ paddingHorizontal: 12 }}>
                  Join Guardian Band to coordinate safety and protect your journeys.
                </Typography>
              </Animated.View>

              {/* Input Card Container */}
              <Animated.View style={cardAnimatedStyle}>
                <Card variant="glass" padding="large" style={{ marginBottom: 20 }}>
                  <Input
                    ref={nameRef}
                    label="Full Name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Enter your full name"
                    error={nameError}
                    variant="outlined"
                    height="standard"
                    textContentType="name"
                    autoComplete="name"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                  />

                  <Input
                    ref={emailRef}
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
                    height="standard"
                    textContentType="emailAddress"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                  />

                  <Input
                    ref={passwordRef}
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Create a secure password"
                    secureTextEntry
                    error={passwordError}
                    variant="outlined"
                    height="standard"
                    textContentType="newPassword"
                    autoComplete="password-new"
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  
                  {/* Live Password Requirements checklist */}
                  <View style={{ marginTop: -8, marginBottom: 16, paddingHorizontal: 4 }}>
                    <Typography variant="caption" color="secondary" style={{ marginBottom: 8, fontWeight: '700' }}>
                      PASSWORD REQUIREMENTS
                    </Typography>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      <View style={{ width: '50%', marginBottom: 6 }}>
                        {renderRequirement('8+ characters', hasEightChars)}
                      </View>
                      <View style={{ width: '50%', marginBottom: 6 }}>
                        {renderRequirement('Number', hasNumber)}
                      </View>
                      <View style={{ width: '50%', marginBottom: 6 }}>
                        {renderRequirement('Uppercase', hasUppercase)}
                      </View>
                      <View style={{ width: '50%', marginBottom: 6 }}>
                        {renderRequirement('Symbol', hasSymbol)}
                      </View>
                    </View>
                  </View>

                  <Input
                    ref={confirmPasswordRef}
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    placeholder="Confirm your password"
                    secureTextEntry
                    error={confirmPasswordError}
                    variant="outlined"
                    height="standard"
                    textContentType="password"
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />

                  {confirmPassword.length > 0 && (
                    <View style={{ marginTop: -8, marginBottom: 16, paddingHorizontal: 4 }}>
                      <Typography 
                        variant="caption" 
                        style={{ 
                          color: password === confirmPassword ? theme.colors.success : theme.colors.error,
                          fontWeight: '600'
                        }}
                      >
                        {password === confirmPassword ? '✓ Passwords Match' : '✗ Passwords do not match'}
                      </Typography>
                    </View>
                  )}

                  {/* Submit and Login Actions */}
                  <View style={{ gap: 12, marginTop: 12 }}>
                    <Button
                      title="Create Account"
                      onPress={handleRegister}
                      variant="primary"
                      size="xlarge"
                      loading={isLoading}
                      disabled={!isFormValid || isLoading}
                      fullWidth={true}
                    />

                    <TouchableOpacity 
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        navigation.goBack();
                      }}
                      activeOpacity={0.7}
                      style={{ marginTop: 8, alignSelf: 'center', padding: 8 }}
                      accessibilityLabel="Back to sign in page link"
                      accessibilityRole="button"
                    >
                      <Typography variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                        Already have an account? Sign In
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </Card>
              </Animated.View>

              {/* Terms Footer */}
              <Typography variant="caption" color="muted" align="center" style={{ marginTop: 24, paddingHorizontal: 16 }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </View>
          </KeyboardAvoidingView>
        </ScreenLayout>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Card variant="glass" padding="large" style={{ alignItems: 'center' }}>
              <Loader text="Registering your account..." />
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
