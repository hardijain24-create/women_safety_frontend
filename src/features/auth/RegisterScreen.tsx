import React, { useState, useContext, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme';
import { Button, Typography, Input, Icon, ProgressRing } from '../../components/atoms';
import { Card } from '../../components/molecules';
import { AuthContext } from '../../context/AuthContext';
import { showAlert } from '../../utils/alert';

export const RegisterScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { register } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);
  const guardianPhoneRef = useRef<any>(null);

  const hasEightChars = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasEightChars && hasNumber && hasUppercase && hasSymbol;

  const handleNextStep = () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) stepErrors.name = 'Name is required';
      if (!email.trim()) {
        stepErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        stepErrors.email = 'Enter a valid email address';
      }
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!isPasswordValid) return;
      if (password !== confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        return;
      }
      setStep(3);
    }
    setErrors({});
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    if (!guardianName.trim() || !guardianPhone.trim()) {
      setErrors({
        guardianName: !guardianName.trim() ? 'Guardian name required' : '',
        guardianPhone: !guardianPhone.trim() ? 'Guardian phone required' : '',
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        guardian: {
          name: guardianName.trim(),
          phone: guardianPhone.trim(),
        },
      });
    } catch (error: any) {
      showAlert('Registration Failed', error.message || 'Check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRequirement = (label: string, met: boolean) => (
    <View style={styles.reqRow}>
      <Icon name={met ? 'check' : 'close'} size={12} color={met ? theme.colors.success : theme.colors.textMuted} />
      <Typography variant="caption" style={{ color: met ? theme.colors.success : theme.colors.textMuted, fontWeight: met ? '600' : '400' }}>
        {label}
      </Typography>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={theme.isDark ? ['#0E110F', '#161B18'] : ['#FFFFFF', '#F8FAF8']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.wrapper}>
        
        {/* Step Indicator */}
        <View style={styles.header}>
          <ProgressRing progress={(step / 3) * 100} size={36} strokeWidth={3} showText={false} />
          <Typography variant="caption" color="muted" weight="600" style={{ marginLeft: 8 }}>
            STEP {step} OF 3: {step === 1 ? 'CREDENTIALS' : step === 2 ? 'SECURITY' : 'GUARDIAN'}
          </Typography>

        </View>

        <Card variant="glass" padding="medium">
          {step === 1 && (
            <View>
              <Typography variant="h3" color="primary" weight="600" style={{ marginBottom: 16 }}>
                Create Account
              </Typography>
              <Input
                label="Full Name"
                value={name}
                onChangeText={(t) => { setName(t); setErrors({}); }}
                placeholder="Elizabeth Johnson"
                error={errors.name}
                variant="outlined"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
              <Input
                ref={emailRef}
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors({}); }}
                placeholder="elizabeth@domain.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                variant="outlined"
                onSubmitEditing={handleNextStep}
              />
              <Button title="Continue" onPress={handleNextStep} variant="primary" size="large" fullWidth style={{ marginTop: 12 }} />
            </View>
          )}

          {step === 2 && (
            <View>
              <Typography variant="h3" color="primary" weight="600" style={{ marginBottom: 16 }}>
                Create Password
              </Typography>
              <Input
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors({}); }}
                placeholder="••••••••"
                secureTextEntry
                variant="outlined"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              
              <View style={styles.checklist}>
                {renderRequirement('8+ characters', hasEightChars)}
                {renderRequirement('Number', hasNumber)}
                {renderRequirement('Uppercase letter', hasUppercase)}
                {renderRequirement('Special symbol', hasSymbol)}
              </View>

              <Input
                ref={confirmPasswordRef}
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setErrors({}); }}
                placeholder="••••••••"
                secureTextEntry
                error={errors.confirmPassword}
                variant="outlined"
                onSubmitEditing={handleNextStep}
              />
              <Button title="Continue" onPress={handleNextStep} variant="primary" size="large" disabled={!isPasswordValid || !confirmPassword} fullWidth style={{ marginTop: 12 }} />
            </View>
          )}

          {step === 3 && (
            <View>
              <Typography variant="h3" color="primary" weight="600" style={{ marginBottom: 8 }}>
                Emergency Contact
              </Typography>
              <Typography variant="caption" color="muted" style={{ marginBottom: 16 }}>
                Add your primary guardian details. They will be immediately alerted during an SOS event.
              </Typography>
              <Input
                label="Guardian Name"
                value={guardianName}
                onChangeText={(t) => { setGuardianName(t); setErrors({}); }}
                placeholder="Sarah Johnson (e.g. Mother)"
                error={errors.guardianName}
                variant="outlined"
              />
              <Input
                ref={guardianPhoneRef}
                label="Guardian Phone"
                value={guardianPhone}
                onChangeText={(t) => { setGuardianPhone(t); setErrors({}); }}
                placeholder="+15551234567"
                keyboardType="phone-pad"
                error={errors.guardianPhone}
                variant="outlined"
                onSubmitEditing={handleRegister}
              />
              <Button title="Complete Setup" onPress={handleRegister} variant="primary" size="large" loading={loading} disabled={loading} fullWidth style={{ marginTop: 12 }} />
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              if (step > 1) {
                setStep(step - 1);
                setErrors({});
              } else {
                navigation.goBack();
              }
            }}
            activeOpacity={0.7}
            style={styles.backLink}
          >
            <Typography variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {step > 1 ? 'Back to Previous Step' : 'Back to Sign In'}
            </Typography>
          </TouchableOpacity>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
    marginBottom: 8,
  },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  backLink: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 4,
  },
});
