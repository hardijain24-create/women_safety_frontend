import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Input } from '../components/atoms/Input';
import { ScreenLayout } from '../components/organisms/Header';
import { ROUTES } from '../constants';
import { AuthStackParamList } from '../navigation';

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, typeof ROUTES.LOGIN>;

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<LoginNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Password validation (8+ characters)
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Main' as never);
    }, 1000);
  };

  const handleRegister = () => {
    navigation.navigate(ROUTES.REGISTER);
  };

  return (
    <ScreenLayout scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <View style={{ paddingHorizontal: 24 }}>
          {/* Logo Area */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.colors.navy,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Typography variant="h1" color="inverse">
                G
              </Typography>
            </View>
            <Typography variant="h2" color="primary" align="center">
              Guardian Band
            </Typography>
            <Typography variant="bodyLarge" color="muted" align="center" style={{ marginTop: 8 }}>
              Your safety companion
            </Typography>
          </View>

          {/* Form */}
          <View style={{ marginBottom: 24 }}>
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({...errors, email: undefined});
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: undefined});
              }}
              placeholder="Enter your password (min 8 characters)"
              secureTextEntry
              error={errors.password}
            />
          </View>

          {/* Remember Me Toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
            <Button
              title={rememberMe ? '  ' : '  '}
              onPress={() => setRememberMe(!rememberMe)}
              variant="outline"
              size="small"
              style={{
                width: 48,
                height: 48,
                paddingHorizontal: 0,
                paddingVertical: 0,
                borderRadius: 12,
                backgroundColor: rememberMe ? theme.colors.gold : 'transparent',
                borderColor: rememberMe ? theme.colors.gold : theme.colors.border,
              }}
            />
            <Typography variant="body" color="secondary" style={{ marginLeft: 12 }}>
              Remember me
            </Typography>
          </View>

          {/* Login Button */}
          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="primary"
            size="xlarge"
            loading={isLoading}
            style={{ marginBottom: 16 }}
          />

          {/* Register Link */}
          <Button
            title="Create New Account"
            onPress={handleRegister}
            variant="ghost"
            size="large"
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};
