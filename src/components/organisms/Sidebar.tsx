import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';
import { Card } from '../molecules/Card';
import { ROUTES } from '../../constants';

const { width: screenWidth } = Dimensions.get('window');

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

interface SidebarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  isVisible,
  onClose,
}) => {
  const { theme } = useTheme();

  const sidebarItems: SidebarItem[] = [
    { id: '1', label: 'Home', icon: 'home', route: ROUTES.HOME },
    { id: '2', label: 'Location', icon: 'location', route: ROUTES.LOCATION },
    { id: '3', label: 'Band', icon: 'band', route: ROUTES.BAND },
    { id: '4', label: 'Contacts', icon: 'contacts', route: ROUTES.CONTACTS },
    { id: '5', label: 'Alerts', icon: 'alerts', route: ROUTES.ALERTS },
    { id: '6', label: 'Profile', icon: 'profile', route: ROUTES.PROFILE },
  ];

  if (!isVisible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
      <TouchableOpacity 
        style={styles.overlayTouchable} 
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={[styles.sidebar, { backgroundColor: theme.colors.background }]}>
        <Card variant="glass" style={styles.sidebarCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="shield" size={32} color={theme.colors.gold} />
              <Typography variant="h3" color="primary" style={styles.logoText}>
                Guardian
              </Typography>
              <Typography variant="h3" color="gold" style={styles.logoText}>
                Band
              </Typography>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Items */}
          <View style={styles.navContainer}>
            {sidebarItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navItem,
                    isActive && {
                      backgroundColor: theme.colors.primary + '20',
                      borderLeftWidth: 4,
                      borderLeftColor: theme.colors.gold,
                    },
                  ]}
                  onPress={() => {
                    onRouteChange(item.route);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.navItemContent}>
                    <Icon 
                      name={item.icon} 
                      size={24} 
                      color={isActive ? theme.colors.gold : theme.colors.textSecondary} 
                    />
                    <Typography
                      variant="bodyLarge"
                      color={isActive ? 'primary' : 'secondary'}
                      weight={isActive ? '600' : '400'}
                      style={styles.navItemText}
                    >
                      {item.label}
                    </Typography>
                  </View>
                  {isActive && (
                    <Icon name="chevron-right" size={20} color={theme.colors.gold} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Icon name="shield" size={20} color={theme.colors.gold} />
              <Typography variant="caption" color="muted" style={styles.footerText}>
                Safety First, Always
              </Typography>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    width: screenWidth * 0.75,
    maxWidth: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarCard: {
    flex: 1,
    margin: 0,
    borderRadius: 0,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
  },
  navContainer: {
    flex: 1,
    paddingTop: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
    transition: 'all 0.2s ease',
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navItemText: {
    marginLeft: 16,
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 8,
  },
});
