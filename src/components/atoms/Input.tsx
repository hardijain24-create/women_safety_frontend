import React from 'react';
import { TextInput, View, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  maxLength,
}) => {
  const { theme } = useTheme();

  const containerStyle: ViewStyle = {
    marginBottom: 16,
    ...style,
  };

  const inputWrapperStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: error ? theme.colors.error : theme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: multiline ? 16 : 4,
    minHeight: multiline ? 100 : 64,
    opacity: disabled ? 0.6 : 1,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  };

  const textInputStyle: TextStyle = {
    fontSize: 18,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    minHeight: multiline ? 80 : 56,
    textAlignVertical: multiline ? 'top' : 'center',
    ...inputStyle,
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Typography 
          variant="label" 
          color="secondary" 
          style={{ marginBottom: 8, marginLeft: 4 }}
        >
          {label}
        </Typography>
      )}
      <View style={inputWrapperStyle}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={textInputStyle}
          maxLength={maxLength}
        />
      </View>
      {error && (
        <Typography 
          variant="caption" 
          color="muted" 
          style={{ marginTop: 6, marginLeft: 4 }}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};
