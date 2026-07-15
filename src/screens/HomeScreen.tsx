import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';
import { Avatar } from '../components/atoms/Avatar';
import { Card } from '../components/molecules/Card';
import { QuickActionGrid } from '../components/molecules/QuickAction';
import { HeroSOSButton } from '../components/molecules/HeroSOSButton';
import { ScreenLayout, Header, StatusGrid } from '../components/organisms';
import { mockDeviceStatus, mockUserProfile, ROUTES } from '../constants';
import { RootStackParamList } from '../navigation';
import { AuthContext } from '../context/AuthContext';
import { alertApi } from '../api/services';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeNavigationProp>();
  const [deviceStatus, setDeviceStatus] = useState(mockDeviceStatus);
  const { user } = React.useContext(AuthContext);


  useEffect(() => {
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      if (user?.id) {
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert("Check-in Sent", "Your contacts have been notified you are safe");
  };

  const handleSOSPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    navigation.navigate(ROUTES.SOS);
  };

  const quickActions = [
    {
      icon: 'location',
      label: 'Share Location',
      onPress: handleShareLocation,
      variant: 'default' as const,
    },
    {
      icon: 'check',
      label: "I'm Safe",
      onPress: handleImSafe,
      variant: 'gold' as const,
    },
    {
      icon: 'contacts',
      label: 'Guardians',
      onPress: () => navigation.navigate(ROUTES.CONTACTS as never),
      variant: 'default' as const,
    },
  ];


  return (
    <ScreenLayout
      header={
        <Header
          title="Home"
          subtitle="Ambient Protection Active"
          rightAction={{
            icon: 'settings',
            onPress: () => navigation.navigate(ROUTES.PROFILE as never),
          }}
        />
      }
      scrollable={true}
      safeArea={true}
    >
      <View style={{ paddingBottom: 32 }}>
        
        {/* Welcome Greeting Banner */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
          <Avatar name={mockUserProfile.name} size="md" />
          <View style={{ marginLeft: 12 }}>
            <Typography variant="h3" color="primary" weight="700">
              Hello, {mockUserProfile.name.split(' ')[0]}!
            </Typography>
            <Typography variant="caption" color="muted">
              Your safety is our priority today.
            </Typography>
          </View>
        </View>
        
        {/* Core SOS Action Area */}
        <HeroSOSButton
          onPress={handleSOSPress}
          style={{ marginBottom: 16 }}
        />

        {/* Diagnostics Card Grid (StatusGrid Organism) */}
        <View style={{ marginBottom: 20 }}>
          <StatusGrid
            deviceStatus={deviceStatus}
            onGPSPress={handleShareLocation}
            onDevicePress={() => navigation.navigate(ROUTES.BAND as never)}
          />
        </View>

        {/* Quick Actions Drawer */}
        <Card variant="default" padding="medium" style={{ marginBottom: 20 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 12, marginLeft: 4 }}>
            Quick Actions
          </Typography>
          <QuickActionGrid actions={quickActions} />
        </Card>

        {/* Device Status Detail Row */}
        <Card variant="default" padding="medium">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Icon name="battery-full" size={24} color={deviceStatus.batteryLevel > 20 ? theme.colors.primary : theme.colors.error} />
              <View>
                <Typography variant="body" color="primary" weight="600">
                  ESP32 Wearable
                </Typography>
                <Typography variant="caption" color="muted">
                  Battery level: {deviceStatus.batteryLevel}% • {deviceStatus.isCharging ? 'Charging' : 'On Battery'}
                </Typography>
              </View>
            </View>
            <Badge 
              label={deviceStatus.isConnected ? "Sync OK" : "Offline"}
              variant={deviceStatus.isConnected ? "primary" : "error"}
              size="small"
            />
          </View>
        </Card>

      </View>
    </ScreenLayout>
  );
};
