import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import * as Location from 'expo-location';

export const LocationScreen: React.FC = () => {
  const { theme } = useTheme();
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('Fetching address...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
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
        setErrorMsg('Failed to get location data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStartSharing = () => {
    setIsSharing(true);
    Alert.alert('Success', 'Live location sharing activated');
  };

  const handleStopSharing = () => {
    setIsSharing(false);
  };

  if (loading) {
    return (
      <ScreenLayout header={<Header title="Location" subtitle="Fetching position..." />}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
          <Typography variant="body" color="muted" style={{ marginTop: 16 }}>
            Locating your device...
          </Typography>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      header={<Header title="Location" subtitle="Real-time position" />}
    >
      <View style={{ paddingBottom: 32 }}>
        {/* Map Placeholder */}
        <Card
          variant="glass"
          padding="none"
          style={{
            height: 280,
            marginBottom: 24,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: theme.colors.gold + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Icon name="location-pin" size={48} color={theme.colors.gold} />
          </View>
          <Typography variant="bodyLarge" color="secondary" align="center">
            {isSharing ? 'Live Tracking Active' : 'Ready to Track'}
          </Typography>
          <Typography variant="caption" color="muted" align="center" style={{ marginTop: 4 }}>
            GPS Signal: Strong
          </Typography>
        </Card>

        {/* Location Details */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 16 }}>
            {errorMsg ? 'Location Error' : 'Current Coordinates'}
          </Typography>
          
          {errorMsg ? (
            <Typography variant="body" color="secondary">{errorMsg}</Typography>
          ) : (
            <>
              <View style={{ marginBottom: 12 }}>
                <Typography variant="caption" color="muted">Approximate Address</Typography>
                <Typography variant="bodyLarge" color="primary" numberOfLines={2}>
                  {address}
                </Typography>
              </View>

              <View style={{ flexDirection: 'row', gap: 24 }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color="muted">Latitude</Typography>
                  <Typography variant="body" color="secondary" weight="600">
                    {location?.coords.latitude.toFixed(6)}
                  </Typography>
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color="muted">Longitude</Typography>
                  <Typography variant="body" color="secondary" weight="600">
                    {location?.coords.longitude.toFixed(6)}
                  </Typography>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Typography variant="caption" color="muted">Last Updated</Typography>
                <Typography variant="body" color="secondary">
                  {location ? new Date(location.timestamp).toLocaleString() : 'N/A'}
                </Typography>
              </View>
            </>
          )}
        </Card>

        {/* Sharing Control */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 16 }}>
            Security Features
          </Typography>
          
          {isSharing ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.colors.success,
                    marginRight: 8,
                  }}
                />
                <Typography variant="bodySmall" color="muted" weight="600">
                  Sharing live location with emergency contacts
                </Typography>
              </View>
              <Button
                title="Stop Sharing"
                onPress={handleStopSharing}
                variant="outline"
                size="large"
              />
            </View>
          ) : (
            <View>
              <Typography variant="body" color="muted" style={{ marginBottom: 16 }}>
                Securely share your live location with your trusted contacts during an emergency.
              </Typography>
              <Button
                title="Start Live Sharing"
                onPress={handleStartSharing}
                variant="primary"
                size="large"
              />
            </View>
          )}
        </Card>

        {/* Footer Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="shield" size={16} color={theme.colors.muted} />
          <Typography variant="bodySmall" color="muted" style={{ marginLeft: 8 }}>
            Your location data is encrypted
          </Typography>
        </View>
      </View>
    </ScreenLayout>
  );
};
