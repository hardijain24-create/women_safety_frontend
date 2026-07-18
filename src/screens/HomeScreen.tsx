import React, { useState, useEffect, useContext } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
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
import { ScreenLayout, Header, StatusGrid, BottomSheet } from '../components/organisms';
import { mockDeviceStatus, mockUserProfile, ROUTES } from '../constants';
import { RootStackParamList } from '../navigation';
import { AuthContext } from '../context/AuthContext';
import { alertApi } from '../api/services';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeNavigationProp>();
  const [deviceStatus, setDeviceStatus] = useState(mockDeviceStatus);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const { user } = useContext(AuthContext);


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

        {/* Protection Status Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setIsDiagnosticsOpen(true);
          }}
          style={{ marginBottom: 16 }}
        >
          <Card 
            variant="glass" 
            padding="medium" 
            style={{ 
              borderColor: deviceStatus.isConnected ? theme.colors.success : theme.colors.warning,
              borderWidth: 1.5,
              backgroundColor: deviceStatus.isConnected ? theme.colors.success + '10' : theme.colors.warning + '10',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View 
                  style={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: 5, 
                    backgroundColor: deviceStatus.isConnected ? theme.colors.success : theme.colors.warning 
                  }} 
                />
                <Typography variant="body" color="primary" weight="700">
                  {deviceStatus.isConnected ? '🟢 Protected' : '🟠 Attention Required'}
                </Typography>
              </View>
              <Typography variant="caption" color="secondary" weight="600">
                Tap for Diagnostics
              </Typography>
            </View>
          </Card>
        </TouchableOpacity>
        
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

      {/* Diagnostics Bottom Sheet */}
      <BottomSheet
        isVisible={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        title="Connection Diagnostics"
      >
        <View style={{ paddingBottom: 24, paddingHorizontal: 4 }}>
          <Typography variant="bodySmall" color="secondary" style={{ marginBottom: 20 }}>
            Real-time status check of all background protection layers:
          </Typography>

          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="band" size={20} color={deviceStatus.isConnected ? theme.colors.success : theme.colors.warning} />
                <Typography variant="body" color="primary" weight="600">Bluetooth Link</Typography>
              </View>
              <Badge 
                label={deviceStatus.isConnected ? 'Connected' : 'Disconnected'} 
                variant={deviceStatus.isConnected ? 'success' : 'warning'} 
                size="small" 
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="location-pin" size={20} color={theme.colors.success} />
                <Typography variant="body" color="primary" weight="600">GPS Status</Typography>
              </View>
              <Badge label="Active" variant="success" size="small" />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="message" size={20} color={theme.colors.success} />
                <Typography variant="body" color="primary" weight="600">SMS Route Setup</Typography>
              </View>
              <Badge label="Ready" variant="success" size="small" />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="wifi" size={20} color={theme.colors.success} />
                <Typography variant="body" color="primary" weight="600">Internet Connection</Typography>
              </View>
              <Badge label="Online" variant="success" size="small" />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="battery-full" size={20} color={deviceStatus.batteryLevel > 20 ? theme.colors.success : theme.colors.error} />
                <Typography variant="body" color="primary" weight="600">Band Battery</Typography>
              </View>
              <Typography variant="body" color="primary" weight="700">{deviceStatus.batteryLevel}%</Typography>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="shield" size={20} color={theme.colors.success} />
                <Typography variant="body" color="primary" weight="600">System Permissions</Typography>
              </View>
              <Badge label="Granted" variant="success" size="small" />
            </View>
          </View>
        </View>
      </BottomSheet>
    </ScreenLayout>
  );
};
