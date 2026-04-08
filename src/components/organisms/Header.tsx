import React from 'react';
import { View, SafeAreaView, ViewStyle, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { IconButton } from '../atoms/IconButton';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  transparent?: boolean;
  showMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  transparent = false,
  showMenu = false,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: transparent ? 'transparent' : theme.colors.background,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        {onBack ? (
          <IconButton
            icon="arrow-left"
            onPress={onBack}
            size="medium"
            variant="outlined"
            color="#FFFFFF"
          />
        ) : showMenu ? (
          <IconButton
            icon="menu"
            onPress={handleMenuPress}
            size="medium"
            variant="outlined"
            color="#FFFFFF"
          />
        ) : (
          <View style={{ width: 56 }} />
        )}

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Typography variant="h4" color="inverse" align="center" style={{ color: '#FFFFFF' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="muted" align="center" style={{ color: '#E8E0D0' }}>
              {subtitle}
            </Typography>
          )}
        </View>

        {rightAction ? (
          <IconButton
            icon={rightAction.icon}
            onPress={rightAction.onPress}
            size="medium"
            variant="outlined"
            color="#FFFFFF"
          />
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>
    </SafeAreaView>
  );
};

interface ScreenLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  header,
  scrollable = true,
  safeArea = true,
  style,
  contentContainerStyle,
}) => {
  const { theme } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...style,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: 20,
    paddingBottom: 32,
    ...contentContainerStyle,
  };

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentStyle}
        >
          {children}
        </ScrollView>
      );
    }
    return <View style={{ flex: 1, ...contentStyle }}>{children}</View>;
  };

  return (
    <View style={containerStyle}>
      {header}
      {renderContent()}
    </View>
  );
};
