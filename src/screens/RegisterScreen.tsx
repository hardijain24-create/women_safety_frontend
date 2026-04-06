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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

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
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              maxLength={15}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
            />
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
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
