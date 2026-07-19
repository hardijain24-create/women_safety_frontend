import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme';
import { Typography, Icon, Avatar, ProgressRing, Divider } from '../../components/atoms';
import { Card, HeroSOSButton } from '../../components/molecules';
import { useBle } from '../../context/BleContext';
import { alertApi } from '../../api/services';

import { useLocation } from '../../hooks/useLocation';
import { AuthContext } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ROUTES } from '../../constants';
import { showAlert } from '../../utils/alert';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { vibrationEnabled } = useSettings();

  const { user } = useContext(AuthContext);
  const { isConnected, batteryLevel } = useBle();
  const { address, fetchLocation, shareLocation, isSharing, stopSharing } = useLocation();

  const emergencyContacts = (user?.emergency_contacts || []) as Array<{ name: string; phone: string }>;

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleShareLocation = async () => {
    if (!user?.id) {
      showAlert('Sign In Needed', 'Please log in to share your coordinates.');
      return;
    }
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    try {
      if (isSharing) {
        stopSharing();
        showAlert('Sharing Ended', 'Live coordinate broadcast has been deactivated.');
      } else {
        await shareLocation(user.id);
        showAlert('Coordinates Shared', 'Live coordinates link broadcasted to primary guardians.');
      }
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to trigger location share.');
    }
  };

  const handleImSafe = async () => {
    if (vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    try {
      if (!user?.id) {
        showAlert('Sign In Needed', 'Please log in to send safety check-in.');
        return;
      }
      
      const loc = await fetchLocation();
      const lat = loc ? loc.coords.latitude : 0;
      const lng = loc ? loc.coords.longitude : 0;
      
      await alertApi.triggerAlert({
        user_id: user.id,
        latitude: lat,
        longitude: lng,
        alert_type: 'check_in',
      });
      
      showAlert("Safety Verified", "Sent I'm Safe check-in alert to emergency guardians.");
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to send safety check-in.');
    }
  };

  const handleSOSPress = () => {
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    navigation.navigate(ROUTES.SOS);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fixed Connection Status Header */}
      <View 
        style={[
          styles.fixedHeader, 
          { 
            paddingTop: insets.top + 16,
            backgroundColor: theme.colors.background,
          }
        ]}
      >
        <View style={styles.headerHUD}>
          <View style={styles.statusSection}>
            <View 
              style={[
                styles.statusIndicatorCircle, 
                { backgroundColor: isConnected ? theme.colors.primary : theme.colors.error }
              ]} 
            />
            <Typography 
              variant="bodySmall" 
              style={{ color: isConnected ? theme.colors.primaryDark : theme.colors.error }} 
              weight="700"
            >
              {isConnected ? 'PROTECTED' : 'UNCONNECTED'}
            </Typography>
          </View>
          <Typography variant="caption" color="muted" style={{ fontSize: 11 }}>
            {isConnected
              ? batteryLevel === 'Unavailable' || batteryLevel === null
                ? 'Esp32 • Connected'
                : `Esp32 • ${batteryLevel}%`
              : 'Device Link Offline'}
          </Typography>

          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.PROFILE)}>
            <Avatar name={user?.name || 'User'} size="sm" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 72,
            paddingBottom: insets.bottom + 40,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Safety Status Hero Banner */}
        <Card variant="glass" padding="medium" style={styles.heroCard}>
          <View style={styles.heroBannerContent}>
            <View style={styles.shieldIconContainer}>
              <Icon name="shield" size={28} color={theme.colors.primary} />
            </View>
            <View>
              <Typography variant="h3" color="primary" weight="600" style={{ fontSize: 20 }}>
                You're Safe
              </Typography>
              <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
                Last sync: Just now
              </Typography>
            </View>
          </View>
        </Card>

        {/* Large SOS Action Button moved up */}
        <View style={[styles.sosContainer, { marginVertical: theme.layout.sectionGap }]}>
          <HeroSOSButton onPress={handleSOSPress} />
        </View>

        {/* Floating Quick Action Row */}
        <View style={[styles.actionsRow, { maxWidth: 420, width: '100%' }]}>
          <TouchableOpacity
            style={[styles.glassActionBtn, { backgroundColor: theme.colors.cardGlass }]}
            onPress={handleShareLocation}
            activeOpacity={0.8}
          >
            <Icon name="location-pin" size={20} color={isSharing ? theme.colors.error : theme.colors.primary} />
            <Typography variant="caption" color="secondary" weight="500" style={{ marginTop: 4 }}>
              {isSharing ? 'Stop Share' : 'Share GPS'}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.glassActionBtn, { backgroundColor: theme.colors.cardGlass }]}
            onPress={handleImSafe}
            activeOpacity={0.8}
          >
            <Icon name="check" size={20} color={theme.colors.success} />
            <Typography variant="caption" color="secondary" weight="500" style={{ marginTop: 4 }}>
              I'm Safe
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.glassActionBtn, { backgroundColor: theme.colors.cardGlass }]}
            onPress={() => navigation.navigate(ROUTES.CONTACTS)}
            activeOpacity={0.8}
          >
            <Icon name="contacts" size={20} color={theme.colors.primary} />
            <Typography variant="caption" color="secondary" weight="500" style={{ marginTop: 4 }}>
              Guardians
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Location & Guardians Card moved to the bottom */}
        <Card variant="glass" padding="medium" style={[styles.locationCard, { marginTop: 32 }]}>
          <View style={styles.locationCardHeader}>
            <Icon name="location-pin" size={24} color={theme.colors.primary} />
            <Typography variant="body" color="primary" weight="600" style={{ marginLeft: 8 }}>
              Current Location
            </Typography>
          </View>

          <Typography variant="bodySmall" color="secondary" style={{ marginVertical: 8, lineHeight: 20 }}>
            {address || 'Locating device...'}
          </Typography>

          <Divider margin="medium" />

          <View style={styles.guardiansSection}>
            <Typography variant="caption" color="muted" style={{ marginBottom: 8 }}>
              {emergencyContacts.length > 0
                ? `Sharing coordinates with ${emergencyContacts.length} guardians`
                : 'No emergency contacts added yet'}
            </Typography>
            
            {emergencyContacts.length > 0 && (
              <View style={styles.avatarRow}>
                {emergencyContacts.slice(0, 3).map((contact, idx) => (
                  <Avatar
                    key={idx}
                    name={contact.name}
                    size="sm"
                    style={{
                      marginLeft: idx > 0 ? -12 : 0,
                      borderWidth: 2,
                      borderColor: theme.colors.card,
                    }}
                  />
                ))}
                {emergencyContacts.length > 3 && (
                  <Avatar
                    name={"+ " + (emergencyContacts.length - 3)}
                    size="sm"
                    style={{
                      marginLeft: -12,
                      borderWidth: 2,
                      borderColor: theme.colors.card,
                    }}
                  />
                )}
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroCard: {
    maxWidth: 420,
    width: '100%',
    marginBottom: 18,
  },
  heroBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIconContainer: {
    marginRight: 16,
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  locationCard: {
    maxWidth: 420,
    width: '100%',
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guardiansSection: {
    width: '100%',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  headerHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicatorCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  glassActionBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingSosCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
});
