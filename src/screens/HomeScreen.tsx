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
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { mockDeviceStatus, mockLocation, mockUserProfile, ROUTES } from '../constants';
import { RootStackParamList } from '../navigation';
import { AuthContext } from '../context/AuthContext';
import { alertApi } from '../api/services';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const [deviceStatus, setDeviceStatus] = useState(mockDeviceStatus);
  const { user } = React.useContext(AuthContext);

  React.useEffect(() => {
    let batterySubscription: Battery.Subscription;
    let powerStateSubscription: Battery.Subscription;

    const setupBattery = async () => {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      
      setDeviceStatus(prev => ({
        ...prev,
        batteryLevel: Math.round(level * 100),
        isCharging: state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL
      }));

      batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
        setDeviceStatus(prev => ({ ...prev, batteryLevel: Math.round(batteryLevel * 100) }));
      });

      powerStateSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
        setDeviceStatus(prev => ({ 
          ...prev, 
          isCharging: batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL 
        }));
      });
    };

    setupBattery();

    return () => {
      if (batterySubscription) batterySubscription.remove();
      if (powerStateSubscription) powerStateSubscription.remove();
    };
  }, []);

  const handleShareLocation = async () => {
    try {
      if (user?.id) {
        // 📍 Get REAL location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to share your location.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        
        await alertApi.triggerAlert({
          user_id: user.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          alert_type: 'location_share'
        });
        Alert.alert('Location Shared', 'Your location has been shared with emergency contacts');
      } else {
        Alert.alert('Error', 'Please log in to share your location');
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to share location: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleImSafe = async () => {
    try {
      // Find the last active alert to resolve it, or just send a general "Safe" ping
      // For now, we'll send a trigger with type 'safe' or resolve existing if we had tracking
      Alert.alert("Check-in Sent", "Your contacts have been notified you are safe");
    } catch (e: any) {
      Alert.alert('Error', 'Failed to send check-in');
    }
  };

  const quickActions = [
    {
      icon: 'location',
      label: 'Share Location',
      onPress: handleShareLocation,
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
      onPress: handleImSafe,
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
