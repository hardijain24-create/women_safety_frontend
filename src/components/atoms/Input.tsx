import React, { useState, forwardRef } from 'react';
import { TextInput, View, ViewStyle, TextStyle, TouchableOpacity, TextInputProps } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';
import { Icon } from './Icon';

interface InputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
  
  // New layout and design props
  variant?: 'filled' | 'outlined';
  height?: 'standard' | 'hero';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  error,
  disabled = false,
  readOnly = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  maxLength,
  variant = 'outlined',
  height = 'standard',
  leftIcon,
  rightIcon,
  ...rest
}, ref) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const containerStyle: ViewStyle = {
    marginBottom: theme.layout.cardGap,
    ...style,
  };

  const inputHeight = height === 'hero' ? theme.buttonSizes.lg : theme.buttonSizes.md;

  const isEditable = !disabled && !readOnly;

  const wrapperStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.card.radius - 8, // Outlined field radius aligns inside card
    borderWidth: 1.5,
    paddingHorizontal: theme.layout.cardGap,
    minHeight: multiline ? 100 : inputHeight,
    opacity: disabled ? theme.opacity.disabled : 1,
    
    // Background and border variant handling
    backgroundColor: variant === 'filled' 
      ? theme.colors.backgroundSecondary 
      : theme.colors.card,
    borderColor: error 
      ? theme.colors.error 
      : isFocused 
        ? theme.colors.primary 
        : variant === 'filled' 
          ? 'transparent' 
          : theme.colors.border,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    fontSize: theme.typography.sizeBase,
    color: disabled ? theme.colors.textMuted : theme.colors.textPrimary,
    fontWeight: '500',
    minHeight: multiline ? 80 : inputHeight,
    paddingVertical: multiline ? 12 : 0,
    textAlignVertical: multiline ? 'top' : 'center',
    ...inputStyle,
  };

  const handlePasswordToggle = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    if (secureTextEntry && text.length > value.length) {
      const lastChar = text.charAt(text.length - 1);
      // Check if last typed char is an uppercase letter (A-Z)
      const isUpper = /[A-Z]/.test(lastChar);
      setIsCapsLockOn(isUpper);
    } else if (text.length === 0) {
      setIsCapsLockOn(false);
    }
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Typography 
          variant="label" 
          color="secondary" 
          style={{ marginBottom: 6, marginLeft: 4 }}
        >
          {label}
        </Typography>
      )}
      
      <View style={wrapperStyle}>
        {leftIcon && (
          <View style={{ marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={isEditable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={textInputStyle}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setIsCapsLockOn(false);
          }}
          {...rest}
        />
        
        {secureTextEntry ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isCapsLockOn && (
              <View style={{ marginRight: 8, backgroundColor: theme.colors.warning + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Typography variant="caption" style={{ color: theme.colors.warning, fontWeight: '700', fontSize: 10 }}>
                  CAPS
                </Typography>
              </View>
            )}
            <TouchableOpacity 
              onPress={handlePasswordToggle}
              activeOpacity={0.7}
              style={{ padding: 4, justifyContent: 'center', alignItems: 'center' }}
              accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
              accessibilityRole="button"
            >
              <Icon 
                name={isPasswordVisible ? "eye-off" : "eye"} 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        ) : rightIcon ? (
          <View style={{ marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}>
            {rightIcon}
          </View>
        ) : null}
      </View>
      
      {error && (
        <Typography 
          variant="caption" 
          color="error" 
          style={{ marginTop: 6, marginLeft: 4 }}
        >
          {error}
        </Typography>
      )}
    </View>
  );
});

Input.displayName = 'Input';
