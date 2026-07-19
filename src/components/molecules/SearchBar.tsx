import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';
import * as Haptics from 'expo-haptics';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
}) => {
  const { theme } = useTheme();

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={styles.container}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        leftIcon={<Icon name="search" size={18} color={theme.colors.textMuted} />}
        rightIcon={
          value.length > 0 ? (
            <TouchableOpacity 
              onPress={handleClear} 
              activeOpacity={0.7} 
              style={[styles.clearButton, { backgroundColor: theme.colors.backgroundSecondary }]}
            >
              <Icon name="close" size={14} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : undefined
        }
        variant="filled"
        height="standard"
        style={styles.inputContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 0, // Reset margin since SearchBar handles positioning
  },
  clearButton: {
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
