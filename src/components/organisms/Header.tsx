import React from 'react';
import { View, SafeAreaView, ViewStyle, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { IconButton } from '../atoms/IconButton';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';
import { SearchBar } from '../molecules/SearchBar';

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
  avatar?: {
    name: string;
    imageUri?: string;
    onPress?: () => void;
  };
  showNotification?: boolean;
  onNotificationPress?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  transparent = false,
  showMenu = false,
  avatar,
  showNotification = false,
  onNotificationPress,
  searchQuery,
  onSearchChange,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  const renderLeft = () => {
    if (onBack) {
      return (
        <IconButton
          icon="arrow-left"
          onPress={onBack}
          size="medium"
          variant="outlined"
        />
      );
    }
    if (showMenu) {
      return (
        <IconButton
          icon="menu"
          onPress={handleMenuPress}
          size="medium"
          variant="outlined"
        />
      );
    }
    if (avatar) {
      return (
        <Avatar
          name={avatar.name}
          imageUri={avatar.imageUri}
          size="sm"
          onPress={avatar.onPress}
        />
      );
    }
    return null;
  };

  const renderRight = () => {
    if (rightAction) {
      return (
        <IconButton
          icon={rightAction.icon}
          onPress={rightAction.onPress}
          size="medium"
          variant="outlined"
        />
      );
    }
    if (showNotification) {
      return (
        <TouchableOpacity 
          onPress={onNotificationPress} 
          activeOpacity={0.7}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        >
          <Icon name="bell" size={22} color={theme.colors.primary} />
          {/* Unread dot */}
          <View 
            style={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              width: 8, 
              height: 8, 
              borderRadius: 4, 
              backgroundColor: theme.colors.error 
            }} 
          />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: transparent ? 'transparent' : theme.colors.background,
        borderBottomWidth: searchQuery !== undefined ? 0 : 1,
        borderBottomColor: theme.colors.borderLight,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.layout.screenPadding,
          paddingVertical: theme.spacing.sm + 6,
        }}
      >
        {renderLeft()}

        <View style={{ flex: 1, alignItems: 'flex-start', paddingHorizontal: theme.spacing.sm }}>
          <Typography variant="h3" color="primary" align="left" weight="600">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="muted" align="left" style={{ marginTop: 2, marginLeft: 2 }}>
              {subtitle}
            </Typography>
          )}
        </View>

        {renderRight()}
      </View>

      {searchQuery !== undefined && onSearchChange !== undefined && (
        <View style={{ paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.sm + 4 }}>
          <SearchBar value={searchQuery} onChangeText={onSearchChange} />
        </View>
      )}
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
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.layout.fabBottom,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
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

  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container style={containerStyle}>
      {header}
      {renderContent()}
    </Container>
  );
};
