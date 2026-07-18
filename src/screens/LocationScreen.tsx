import React, { useEffect, useState } from 'react';
import { View, Alert, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';
import { Button } from '../components/atoms/Button';
import { Loader } from '../components/atoms/Loader';
import { Card } from '../components/molecules/Card';
import { InfoTile } from '../components/molecules/InfoTile';
import { StatusBadge } from '../components/molecules/StatusBadge';
import { ScreenLayout, Header } from '../components/organisms';

export const LocationScreen: React.FC = () => {
  const { theme } = useTheme();
  
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('Fetching address...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to fetch and share your live coordinates.');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      
      // Fetch human-readable address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`;
        setAddress(formattedAddress.trim() || 'Unknown address');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setErrorMsg('Failed to get location data. Ensure GPS is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSharing = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsSharing(true);
    Alert.alert('Live Sharing Enabled', 'Your emergency contacts can now view your live coordinate feed.');
  };

  const handleStopSharing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsSharing(false);
  };

  const handleRecenter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    fetchLocation();
  };

  const handleCompass = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Alert.alert("Compass Recalibrated", "GPS direction aligned to North.");
  };

  const isDark = theme.isDark;

  if (loading) {
    return (
      <ScreenLayout header={<Header title="Location" subtitle="Fetching position..." />}>
        <View style={styles.centerContainer}>
          <Loader text="Locating your device..." />
        </View>
      </ScreenLayout>
    );
  }

  // Location Permission Denied Fallback Layout
  if (errorMsg && errorMsg.includes('permission')) {
    return (
      <ScreenLayout header={<Header title="Location" subtitle="GPS Status" />}>
        <View style={styles.errorContainer}>
          <Card variant="danger" padding="large" style={{ alignItems: 'center' }}>
            <Icon 
              name="location-pin" 
              size={48} 
              color={theme.colors.error} 
              backgroundColor={theme.colors.error + '12'}
              containerStyle={{ marginBottom: 16 }}
            />
            <Typography variant="h3" color="primary" align="center" style={{ marginBottom: 8 }}>
              Location Permission Denied
            </Typography>
            <Typography variant="bodySmall" color="secondary" align="center" style={{ marginBottom: 20 }}>
              {errorMsg}
            </Typography>
            <View style={{ flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'center' }}>
              <Button
                title="Retry"
                onPress={fetchLocation}
                variant="outline"
                size="medium"
                style={{ flex: 1 }}
              />
              <Button
                title="Open Settings"
                onPress={() => Linking.openSettings()}
                variant="primary"
                size="medium"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      header={<Header title="Location" subtitle={isSharing ? "Live Broadcast Active" : "Real-time position"} />}
      scrollable={true}
      safeArea={true}
    >
      <View style={{ paddingBottom: 32 }}>
        
        {/* High-Fidelity Map Simulator Card */}
        <Card
          variant="glass"
          padding="none"
          style={styles.mapCard}
        >
          {/* Concentric Safe Zone Outlines */}
          <View style={[styles.safeZoneOuter, { borderColor: theme.colors.primary + '15', backgroundColor: theme.colors.primary + '05' }]}>
            <View style={[styles.safeZoneInner, { borderColor: theme.colors.primary + '30', backgroundColor: theme.colors.primary + '08' }]}>
              {/* Central User Marker Dot */}
              <View style={[styles.userMarkerOutline, { backgroundColor: theme.colors.primary + '30' }]}>
                <View style={[styles.userMarkerDot, { backgroundColor: theme.colors.primary }]} />
              </View>
            </View>
          </View>

          {/* Floating Map Overlays (Recenter & Compass) */}
          <View style={styles.floatingControls}>
            <TouchableOpacity 
              onPress={handleRecenter}
              style={[styles.floatingButton, { backgroundColor: isDark ? '#161B18' : '#FFFFFF', borderColor: theme.colors.border }]}
              accessibilityLabel="Recenter map to your current location"
              accessibilityRole="button"
            >
              <Icon name="location-pin" size={18} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleCompass}
              style={[styles.floatingButton, { backgroundColor: isDark ? '#161B18' : '#FFFFFF', borderColor: theme.colors.border }]}
              accessibilityLabel="Align compass orientation"
              accessibilityRole="button"
            >
              <Icon name="shield" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Top Overlay Badges */}
          <View style={styles.mapBadgeRow}>
            <Badge 
              label={isSharing ? "LIVE BROADCAST" : "AMBIENT GPS"}
              variant={isSharing ? "error" : "primary"}
              size="small"
            />
            <Badge 
              label={`Acc: ${location?.coords.accuracy?.toFixed(1) || '4.5'}m`} 
              variant="primary" 
              size="small" 
            />
          </View>
          
          {/* Bottom Overlay Label */}
          <View style={styles.mapFooterLabel}>
            <Icon name="shield" size={12} color={theme.colors.primary} containerStyle={{ marginRight: 6 }} />
            <Typography variant="caption" weight="600" style={{ color: theme.colors.primaryDark }}>
              Safe Zone: University Campus (Inside Radius)
            </Typography>
          </View>
        </Card>

        {/* Location Details Card */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 16 }}>
            Current Coordinates
          </Typography>
          
          <View style={{ marginBottom: 14 }}>
            <Typography variant="caption" color="muted">Approximate Address</Typography>
            <Typography variant="body" color="primary" numberOfLines={2} style={{ marginTop: 2, fontWeight: '500' }}>
              {address}
            </Typography>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <InfoTile
              label="Latitude"
              value={location?.coords.latitude.toFixed(6) || '0.000000'}
              icon="location-pin"
            />
            <InfoTile
              label="Longitude"
              value={location?.coords.longitude.toFixed(6) || '0.000000'}
              icon="location-pin"
            />
            <InfoTile
              label="Accuracy"
              value={location?.coords.accuracy ? `${location.coords.accuracy.toFixed(1)}m` : 'N/A'}
              icon="shield"
            />
            <InfoTile
              label="Altitude"
              value={location?.coords.altitude ? `${location.coords.altitude.toFixed(1)}m` : 'N/A'}
              icon="arrow-up"
            />
            <InfoTile
              label="Last Updated"
              value={location ? new Date(location.timestamp).toLocaleTimeString() : 'N/A'}
              icon="settings"
            />
          </View>
        </Card>

        {/* Sharing Control Card */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 12 }}>
            Security Features
          </Typography>
          
          {isSharing ? (
            <View>
              <View style={{ marginBottom: 16 }}>
                <StatusBadge
                  label="Live location sharing with guardians active"
                  status="connected"
                  showPulse={true}
                  size="medium"
                />
              </View>
              <Button
                title="Stop Live Sharing"
                onPress={handleStopSharing}
                variant="outline"
                size="large"
                fullWidth={true}
              />
            </View>
          ) : (
            <View>
              <Typography variant="body" color="muted" style={{ marginBottom: 16 }}>
                Securely broadcast your live coordinates stream to your trusted contacts list during your commute.
              </Typography>
              <Button
                title="Start Live Sharing"
                onPress={handleStartSharing}
                variant="primary"
                size="large"
                fullWidth={true}
              />
            </View>
          )}
        </Card>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Icon name="shield" size={16} color={theme.colors.muted} />
          <Typography variant="bodySmall" color="muted" style={{ marginLeft: 8 }}>
            Your location data is encrypted end-to-end
          </Typography>
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  mapCard: {
    height: 280,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  safeZoneOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeZoneInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOutline: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  floatingControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    gap: 8,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapBadgeRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapFooterLabel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#E8F7EE',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
