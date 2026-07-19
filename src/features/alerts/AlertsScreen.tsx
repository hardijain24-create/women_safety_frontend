import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, AccessibilityInfo } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme';
import { Typography, Icon, Chip, ProgressRing } from '../../components/atoms';
import { Card } from '../../components/molecules';
import { ScreenLayout, Header } from '../../components/organisms';
import { alertApi } from '../../api/services';
import type { AlertItem } from '../../types';
import { parseServerDate } from '../../utils/parseServerDate';

const formatTimestamp = (dateStr: string) => {
  try {
    const date = parseServerDate(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const mapRawAlertToAlertItem = (raw: any): AlertItem => {
  if (raw.title && raw.message) {
    return raw;
  }

  const isResolved = raw.is_resolved || raw.status === 'resolved';
  const hasDevice = !!raw.device_id;
  
  // Use backend alert_type if present, otherwise fallback based on device_id
  const rawType = raw.alert_type || (hasDevice ? 'band_trigger' : 'sos');
  const type = (rawType === 'location_share') ? 'system' : rawType;
  
  const severity = isResolved ? 'low' : (type === 'check_in' ? 'medium' : 'critical');
  
  let title = 'Emergency SOS Alert';
  if (isResolved) {
    title = 'SOS Alert Resolved';
  } else if (type === 'check_in') {
    title = 'Safety Check-in';
  } else if (hasDevice) {
    title = 'Guardian Band Triggered';
  }

  let message = `Safety alert active. Coordinates: ${raw.latitude || 0}, ${raw.longitude || 0}`;
  if (isResolved) {
    message = `SOS emergency at coordinates ${raw.latitude || 0}, ${raw.longitude || 0} has been resolved safely.`;
  } else if (type === 'check_in') {
    message = `I'm Safe: Checked in safely at coordinates ${raw.latitude || 0}, ${raw.longitude || 0}`;
  } else if (hasDevice) {
    message = `Guardian watch button press detected. Coordinates: ${raw.latitude || 0}, ${raw.longitude || 0}`;
  } else {
    message = `Live coordinate tracking active. Coordinates: ${raw.latitude || 0}, ${raw.longitude || 0}`;
  }

  return {
    id: raw.id || raw._id || String(Math.random()),
    type,
    title,
    message,
    timestamp: raw.created_at ? formatTimestamp(raw.created_at) : 'Just now',
    isRead: isResolved,
    severity,
    status: isResolved ? 'resolved' : 'active',
  };
};

export const AlertsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await alertApi.getAlerts();
      console.log('[AlertsScreen] fetchAlerts API Response:', JSON.stringify(res, null, 2));
      if (res.success && res.data) {
        const mapped = res.data.map(mapRawAlertToAlertItem);
        setAlerts(mapped);
      }
    } catch (e) {
      console.warn('Error loading alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await alertApi.getAlerts();
      console.log('[AlertsScreen] handleRefresh API Response:', JSON.stringify(res, null, 2));
      if (res.success && res.data) {
        const mapped = res.data.map(mapRawAlertToAlertItem);
        setAlerts(mapped);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleFilterPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFilter(category);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All') return true;
    if (filter === 'SOS') return alert.type === 'sos' || alert.type === 'band_trigger';
    if (filter === 'Safe Check-ins') return alert.type === 'check_in';
    if (filter === 'Warnings') return alert.type === 'battery_low' || alert.type === 'system';
    return true;
  });

  const getAlertConfig = (type: string, severity: string) => {
    // SOS / band_trigger / critical / high severity
    if (type === 'sos' || type === 'band_trigger' || severity === 'critical' || severity === 'high') {
      return {
        nodeColor: theme.colors.error, // Coral
        cardStyle: {
          backgroundColor: theme.colors.error + '08', // 8% opacity coral tint
          borderColor: theme.colors.error,
          borderWidth: 1.5,
        },
      };
    }
    // Safe check-in
    if (type === 'check_in') {
      return {
        nodeColor: theme.colors.primary, // Green
        cardStyle: {
          backgroundColor: theme.colors.primary + '08', // 8% opacity green tint
          borderColor: theme.colors.primary,
          borderWidth: 1.5,
        },
      };
    }
    // Warnings / system / others
    return {
      nodeColor: theme.colors.warning, // Warning (orange)
      cardStyle: {
        backgroundColor: theme.colors.warning + '08', // 8% opacity warning tint
        borderColor: theme.colors.warning,
        borderWidth: 1.5,
      },
    };
  };

  return (
    <ScreenLayout header={<Header title="Safety Feed" subtitle="Activity Logs Timeline" />} scrollable={false} safeArea>
      <View style={{ flex: 1 }}>
        {/* Filter Pills */}
        <View style={styles.filterBar}>
          {['All', 'SOS', 'Safe Check-ins', 'Warnings'].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={filter === cat}
              onPress={() => handleFilterPress(cat)}
              variant="primary"
            />
          ))}
        </View>

        {/* Timeline Log */}
        <ScrollView
          contentContainerStyle={styles.scrollWrapper}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />}
          showsVerticalScrollIndicator={false}
        >
          {loading && !refreshing ? (
            <Typography variant="bodySmall" color="muted" align="center" style={{ marginTop: 24 }}>
              Loading safety timeline...
            </Typography>
          ) : filteredAlerts.length > 0 ? (
            <View style={styles.timelineContainer}>
              {/* Vertical timeline trunk */}
              <View style={[styles.timelineTrunk, { backgroundColor: theme.colors.border }]} />

              {filteredAlerts.map((item, idx) => {
                const { nodeColor, cardStyle } = getAlertConfig(item.type, item.severity);
                return (
                  <Animated.View
                    key={item.id || idx}
                    entering={reduceMotion ? undefined : FadeInUp.delay(idx * 40).duration(200)}
                    style={styles.timelineRow}
                  >
                    {/* Node Dot */}
                    <View style={styles.nodeColumn}>
                      <ProgressRing
                        progress={100}
                        size={16}
                        strokeWidth={3}
                        color={nodeColor}
                        showText={false}
                      />
                    </View>

                    {/* Timeline Item Content */}
                    <View style={styles.contentColumn}>
                      <Card variant="default" padding="medium" style={{ ...styles.itemCard, ...cardStyle }}>
                        <View style={styles.itemHeader}>
                          <Typography variant="body" color="primary" weight="600">
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="muted">
                            {item.timestamp}
                          </Typography>
                        </View>
                        <Typography variant="caption" color="secondary" style={{ marginTop: 6, lineHeight: 16 }}>
                          {item.message}
                        </Typography>
                      </Card>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            <Card variant="glass" padding="medium" style={styles.emptyCard}>
              <Icon name="shield" size={40} color={theme.colors.success} containerStyle={{ marginBottom: 12 }} />
              <Typography variant="bodySmall" color="secondary" align="center">
                Your environment is completely safe. No active notifications.
              </Typography>
            </Card>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  scrollWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 24,
  },
  timelineTrunk: {
    position: 'absolute',
    left: 8,
    top: 12,
    bottom: 12,
    width: 2,
    zIndex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  nodeColumn: {
    position: 'absolute',
    left: -24,
    width: 18,
    alignItems: 'center',
    zIndex: 2,
    top: 10,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  itemCard: {
    minHeight: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: 24,
  },
});
