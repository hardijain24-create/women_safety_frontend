import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Input } from '../components/atoms/Input';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { AuthContext } from '../context/AuthContext';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = React.useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name, email, password });
      // Navigation to Main is handled automatically by AuthContext state change in Navigation.tsx
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
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
            <Typography variant="caption" color="muted" style={{ marginTop: -8, marginBottom: 16 }}>
              Hint: 8+ characters, uppercase, lowercase, and a number.
            </Typography>
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
