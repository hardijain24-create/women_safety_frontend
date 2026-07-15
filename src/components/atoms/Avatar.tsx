import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';

interface AvatarProps {
  name?: string;
  imageUri?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  borderColor?: string;
  onPress?: () => void;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  imageUri,
  size = 'md',
  borderColor,
  onPress,
  style,
}) => {
  const { theme } = useTheme();

  const getDim = () => {
    if (typeof size === 'number') return size;
    return theme.avatarSizes[size] || theme.avatarSizes.md;
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const dimension = getDim();

  const containerStyle = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
      backgroundColor: theme.colors.primary + '15',
      borderWidth: borderColor ? 2 : 0,
      borderColor: borderColor,
    },
    style
  ];

  const content = imageUri ? (
    <Image 
      source={{ uri: imageUri }} 
      style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }} 
    />
  ) : (
    <Typography 
      variant={dimension < 30 ? 'caption' : dimension < 50 ? 'body' : 'h3'}
      style={{ color: theme.colors.primaryDark, fontWeight: '700' }}
    >
      {getInitials(name)}
    </Typography>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={containerStyle}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
