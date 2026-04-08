import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Input } from '../components/atoms/Input';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { ROUTES } from '../constants';
import { AuthStackParamList } from '../navigation';

type RegisterNavigationProp = StackNavigationProp<AuthStackParamList, typeof ROUTES.REGISTER>;

export const RegisterScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<RegisterNavigationProp>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{name?: string; phone?: string; password?: string; confirmPassword?: string}>({});

  const validateForm = () => {
    const newErrors: {name?: string; phone?: string; password?: string; confirmPassword?: string} = {};
    
    // Name validation
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Phone validation
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Password validation (8+ characters)
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate(ROUTES.LOGIN);
    }, 1000);
  };

  return (
    <ScreenLayout
      header={
        <Header
          title="Create Account"
          onBack={() => navigation.goBack()}
        />
      }
      scrollable={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          <Typography variant="bodyLarge" color="muted" align="center" style={{ marginBottom: 32 }}>
            Join Guardian Band for peace of mind
          </Typography>

          {/* Form */}
          <View style={{ marginBottom: 32 }}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({...errors, name: undefined});
              }}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.name}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors({...errors, phone: undefined});
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              maxLength={15}
              error={errors.phone}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: undefined});
              }}
              placeholder="Create a password (min 8 characters)"
              secureTextEntry
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({...errors, confirmPassword: undefined});
              }}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          {/* Register Button */}
          <Button
            title="Create Account"
            onPress={handleRegister}
            variant="primary"
            size="xlarge"
            loading={isLoading}
          />

          {/* Terms */}
          <Typography variant="caption" color="muted" align="center" style={{ marginTop: 24 }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};
