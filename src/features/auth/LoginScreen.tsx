import React, { useState, useContext, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme';
import { Button, Typography, Input, Icon } from '../../components/atoms';
import { Card } from '../../components/molecules';
import { ROUTES } from '../../constants';
import { AuthContext } from '../../context/AuthContext';
import { showAlert } from '../../utils/alert';

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    console.log('[LoginScreen] handleLogin triggered. Email:', email);
    let hasError = false;

    if (!email) {
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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) {
      console.log('[LoginScreen] Form validation failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setLoading(true);
    console.log('[LoginScreen] Form valid, calling AuthContext.login...');
    try {
      await login({ email, password });
      console.log('[LoginScreen] AuthContext.login succeeded');
    } catch (error: any) {
      console.error('[LoginScreen] AuthContext.login failed with error:', error);
      showAlert('Sign In Failed', error.message || 'Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };


  const isFormValid = email.trim().length > 0 && password.length >= 6;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={theme.isDark ? ['#0E110F', '#161B18'] : ['#FFFFFF', '#F8FAF8']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.scrollWrapper}>
        {/* Header Block */}
        <View style={styles.header}>
          <View style={[styles.logoOutline, { backgroundColor: theme.colors.primary + '10' }]}>
            <Icon name="shield" size={40} color={theme.colors.primary} />
          </View>
          <Typography variant="h1" color="primary" weight="600" align="center" style={styles.title}>
            Guardian Band
          </Typography>

          <Typography variant="body" color="muted" align="center" style={styles.subtitle}>
            Your premium personal safety companion.
          </Typography>
        </View>

        {/* Floating Card Content */}
        <Card variant="glass" padding="medium" style={styles.card}>
          <Typography variant="h3" color="primary" weight="600" style={styles.cardTitle}>
            Sign In
          </Typography>

          <Input
            ref={emailRef}
            label="Email Address"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (emailError) setEmailError('');
            }}
            placeholder="name@domain.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            variant="outlined"
            leftIcon={<Icon name="email" size={18} color={theme.colors.textMuted} />}
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />

          <View style={{ height: 6 }} />

          <Input
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (passwordError) setPasswordError('');
            }}
            placeholder="••••••••"
            secureTextEntry
            error={passwordError}
            variant="outlined"
            leftIcon={<Icon name="settings" size={18} color={theme.colors.textMuted} />}
            onSubmitEditing={handleLogin}
          />

          {/* Remember Me */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setRememberMe(!rememberMe);
              }}
              style={styles.rememberBtn}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: rememberMe ? theme.colors.primary : theme.colors.border,
                    backgroundColor: rememberMe ? theme.colors.primary : 'transparent',
                  },
                ]}
              >
                {rememberMe && <Icon name="check" size={12} color={theme.colors.textInverse} />}
              </View>
              <Typography variant="caption" color="secondary">
                Remember me
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => showAlert('Support Request', 'Please contact support@guardianband.com to recover your password.')}
            >
              <Typography variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                Forgot Password?
              </Typography>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={loading}
            disabled={!isFormValid || loading}
            fullWidth
          />

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              navigation.navigate(ROUTES.REGISTER);
            }}
            activeOpacity={0.7}
            style={styles.registerLink}
          >
            <Typography variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              Create New Account
            </Typography>
          </TouchableOpacity>
        </Card>

        {/* Biometrics Illustration HUD */}
        <View style={styles.biometricsContainer}>
          <Typography variant="caption" color="muted" style={{ marginBottom: 12 }}>
            Or sign in with biometric authentication
          </Typography>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => showAlert('Biometrics', 'Please sign in with credentials first, then activate Face ID in Settings.')}
            style={[styles.biometricCircle, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border }]}
          >
            <Icon name="shield" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoOutline: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 260,
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  registerLink: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 4,
  },
  biometricsContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  biometricCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
