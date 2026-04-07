import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { mockLocation } from '../constants';

export const LocationScreen: React.FC = () => {
  const { theme } = useTheme();
  const [isSharing, setIsSharing] = React.useState(false);

  const handleStartSharing = () => {
    setIsSharing(true);
  };

  const handleStopSharing = () => {
    setIsSharing(false);
  };

  return (
    <ScreenLayout
      header={<Header title="Location" subtitle="Track your position" />}
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
            <Icon name="location" size={48} color={theme.colors.gold} />
          </View>
          <Typography variant="bodyLarge" color="secondary" align="center">
            Map View
          </Typography>
          <Typography variant="caption" color="muted" align="center" style={{ marginTop: 4 }}>
            (Mock Map Interface)
          </Typography>
        </Card>

        {/* Location Details */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 16 }}>
            Current Location
          </Typography>
          
          <View style={{ marginBottom: 12 }}>
            <Typography variant="caption" color="muted">Address</Typography>
            <Typography variant="bodyLarge" color="primary">
              {mockLocation.address}
            </Typography>
          </View>

          <View style={{ flexDirection: 'row', gap: 24 }}>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color="muted">Latitude</Typography>
              <Typography variant="body" color="secondary">
                {mockLocation.latitude.toFixed(4)}
              </Typography>
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color="muted">Longitude</Typography>
              <Typography variant="body" color="secondary">
                {mockLocation.longitude.toFixed(4)}
              </Typography>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Typography variant="caption" color="muted">Last Updated</Typography>
            <Typography variant="body" color="secondary">
              {new Date(mockLocation.timestamp).toLocaleString()}
            </Typography>
          </View>

          <View style={{ marginTop: 12 }}>
            <Typography variant="caption" color="muted">GPS Accuracy</Typography>
            <Typography variant="body" color="secondary">
              {mockLocation.accuracy} meters
            </Typography>
          </View>
        </Card>

        {/* Sharing Control */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 16 }}>
            Live Location Sharing
          </Typography>
          
          {isSharing ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: theme.colors.success,
                    marginRight: 8,
                  }}
                />
                <Typography variant="body" color="muted" weight="600">
                  Sharing Active
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
                Share your live location with emergency contacts
              </Typography>
              <Button
                title="Start Sharing"
                onPress={handleStartSharing}
                variant="primary"
                size="large"
              />
            </View>
          )}
        </Card>

        {/* GPS Status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="location-pin" size={20} color={theme.colors.success} />
          <Typography variant="bodySmall" color="muted" style={{ marginLeft: 8 }}>
            GPS Signal Strong
          </Typography>
        </View>
      </View>
    </ScreenLayout>
  );
};
