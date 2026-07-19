import React, { useEffect, useContext } from 'react';
import { View, Linking, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Button } from '../components/atoms/Button';
import { Loader } from '../components/atoms/Loader';
import { Badge } from '../components/atoms/Badge';
import { Card } from '../components/molecules/Card';
import { InfoTile } from '../components/molecules/InfoTile';
import { StatusBadge } from '../components/molecules/StatusBadge';
import { ScreenLayout, Header } from '../components/organisms';
import { useLocation } from '../hooks/useLocation';
import { AuthContext } from '../context/AuthContext';
import { showAlert } from '../utils/alert';

export const LocationScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);
  
  const {
    location,
    address,
    error: errorMsg,
    loading,
    isSharing,
    fetchLocation,
    shareLocation,
    stopSharing,
  } = useLocation();

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleStartSharing = async () => {
    if (!user?.id) {
      showAlert('Sign In Needed', 'Please log in to share your coordinates.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    try {
      await shareLocation(user.id);
      showAlert('Live Sharing Enabled', 'Your emergency contacts can now view your live coordinate feed.');
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to start location sharing.');
    }
  };

  const handleStopSharing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    stopSharing();
  };



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
        


        {/* Location Details Card */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Typography variant="h4" color="primary">
              Current Coordinates
            </Typography>
            {isSharing && (
              <Badge label="Sharing Active" variant="success" size="small" />
            )}
          </View>
          
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
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
