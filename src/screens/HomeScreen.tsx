import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Card } from '../components/molecules/Card';
import { QuickActionGrid } from '../components/molecules/QuickAction';
import { DeviceStatusCard } from '../components/molecules/StatusBadge';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { DevicePanel } from '../components/organisms/DevicePanel';
import { mockDeviceStatus, mockLocation, mockUserProfile, ROUTES } from '../constants';
import { RootStackParamList } from '../navigation';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeNavigationProp>();
  const [deviceStatus, setDeviceStatus] = useState(mockDeviceStatus);

  const quickActions = [
    {
      icon: 'location',
      label: 'Share Location',
      onPress: () => Alert.alert('Location Shared', 'Your location has been shared with emergency contacts'),
      variant: 'default' as const,
    },
    {
      icon: 'sos',
      label: 'Emergency SOS',
      onPress: () => navigation.navigate(ROUTES.SOS),
      variant: 'danger' as const,
    },
    {
      icon: 'check',
      label: "I'm Safe",
      onPress: () => Alert.alert("Check-in Sent", "Your contacts have been notified you are safe"),
      variant: 'primary' as const,
    },
    {
      icon: 'contacts',
      label: 'View Contacts',
      onPress: () => navigation.navigate(ROUTES.CONTACTS as never),
      variant: 'default' as const,
    },
  ];

  return (
    <ScreenLayout
      header={
        <Header
          title={`Hello, ${mockUserProfile.name.split(' ')[0]}`}
          subtitle="Your safety is our priority"
          rightAction={{
            icon: 'settings',
            onPress: () => navigation.navigate(ROUTES.PROFILE as never),
          }}
        />
      }
    >
      <View style={{ paddingBottom: 32 }}>
        {/* Device Status Panel */}
        <View style={{ marginBottom: 24 }}>
          <DevicePanel deviceStatus={deviceStatus} />
        </View>

        {/* Quick Actions */}
        <Card variant="default" padding="large" style={{ marginBottom: 24 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 20 }}>
            Quick Actions
          </Typography>
          <QuickActionGrid actions={quickActions} />
        </Card>

        {/* Device Status Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <DeviceStatusCard
            title="Battery"
            value={`${deviceStatus.batteryLevel}%`}
            icon="battery-full"
            status={deviceStatus.batteryLevel > 20 ? 'good' : 'warning'}
            subtitle={deviceStatus.isCharging ? 'Charging' : 'On Battery'}
          />
          <DeviceStatusCard
            title="Network"
            value={`${deviceStatus.signalStrength}%`}
            icon="wifi"
            status={deviceStatus.signalStrength > 30 ? 'good' : 'warning'}
            subtitle="Connected"
          />
          <DeviceStatusCard
            title="GPS"
            value="Active"
            icon="location-pin"
            status="good"
            subtitle={`Acc: ${mockLocation.accuracy}m`}
          />
          <DeviceStatusCard
            title="Band"
            value={deviceStatus.isConnected ? 'Linked' : 'Off'}
            icon="band"
            status={deviceStatus.isConnected ? 'good' : 'critical'}
            subtitle={deviceStatus.lastSync}
          />
        </View>
      </View>
    </ScreenLayout>
  );
};
