import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Chip } from '../components/atoms/Chip';
import { Skeleton } from '../components/atoms/Skeleton';
import { Icon } from '../components/atoms/Icon';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { AlertCard } from '../components/molecules/AlertCard';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { alertApi } from '../api/services';
import type { AlertItem } from '../types';

export const AlertsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Severity filter state
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await alertApi.getAlerts();
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await alertApi.getAlerts();
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filter alerts by active severity category
  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Critical') return alert.severity === 'critical' || alert.severity === 'high';
    if (activeFilter === 'Warning') return alert.severity === 'medium';
    if (activeFilter === 'System') return alert.severity === 'low';
    return true;
  });

  // Grouping logic: Today vs Yesterday vs Last 7 Days vs Older
  const todayAlerts: AlertItem[] = [];
  const yesterdayAlerts: AlertItem[] = [];
  const last7DaysAlerts: AlertItem[] = [];
  const olderAlerts: AlertItem[] = [];

  filteredAlerts.forEach(alert => {
    const time = alert.timestamp.toLowerCase();
    if (time.includes('today') || time.includes('min ago') || time.includes('hour ago') || time.includes('sec ago')) {
      todayAlerts.push(alert);
    } else if (time.includes('yesterday')) {
      yesterdayAlerts.push(alert);
    } else if (time.includes('day ago') || time.includes('days ago')) {
      const match = time.match(/(\d+)\s+days?\s+ago/);
      const days = match ? parseInt(match[1], 10) : 2;
      if (days <= 7) {
        last7DaysAlerts.push(alert);
      } else {
        olderAlerts.push(alert);
      }
    } else {
      olderAlerts.push(alert);
    }
  });

  const severityFilters = ['All', 'Critical', 'Warning', 'System'];

  return (
    <ScreenLayout
      header={<Header title="Alert History" subtitle="Emergency and system logs" />}
      scrollable={false} // Custom ScrollView inside to support RefreshControl
      safeArea={true}
    >
      {/* Severity Filter Chips */}
      <View style={styles.filterContainer}>
        {severityFilters.map(filter => {
          const isActive = activeFilter === filter;
          return (
            <Chip
              key={filter}
              label={filter}
              selected={isActive}
              onPress={() => setActiveFilter(filter)}
              variant="primary"
            />
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {isLoading && !refreshing ? (
          <View style={{ marginTop: 12 }}>
            <Skeleton variant="list" />
          </View>
        ) : (
          <View>
            {filteredAlerts.length > 0 ? (
              <>
                {/* Today's Section */}
                {todayAlerts.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Typography variant="label" color="secondary" style={styles.sectionHeader}>
                      TODAY
                    </Typography>
                    {todayAlerts.map(alert => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </View>
                )}

                {/* Yesterday's Section */}
                {yesterdayAlerts.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Typography variant="label" color="secondary" style={styles.sectionHeader}>
                      YESTERDAY
                    </Typography>
                    {yesterdayAlerts.map(alert => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </View>
                )}

                {/* Last 7 Days Section */}
                {last7DaysAlerts.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Typography variant="label" color="secondary" style={styles.sectionHeader}>
                      LAST 7 DAYS
                    </Typography>
                    {last7DaysAlerts.map(alert => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </View>
                )}

                {/* Older Section */}
                {olderAlerts.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Typography variant="label" color="secondary" style={styles.sectionHeader}>
                      OLDER
                    </Typography>
                    {olderAlerts.map(alert => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </View>
                )}
              </>
            ) : (
              /* Empty History Placeholder */
              <Card variant="default" padding="large" style={styles.emptyCard}>
                <Icon
                  name="shield"
                  size={48}
                  color={theme.colors.success}
                  backgroundColor={theme.colors.success + '12'}
                  containerStyle={{ marginBottom: 16 }}
                />
                <Typography variant="bodyLarge" color="primary" weight="700" align="center">
                  Everything looks safe
                </Typography>
                <Typography variant="bodySmall" color="muted" align="center" style={{ marginTop: 8, marginBottom: 20, maxWidth: 260, lineHeight: 18 }}>
                  We'll notify you immediately if anything needs your attention.
                </Typography>
                <Button 
                  title="Learn More"
                  onPress={() => Alert.alert("System Health", "The Guardian Band application monitors Bluetooth connectivity, GPS sync, and emergency contact delivery routes in real-time. Keep the app open in the background for continuous tracking.")}
                  variant="outline"
                  size="medium"
                  style={{ paddingHorizontal: 24 }}
                />
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    flexWrap: 'wrap',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  sectionHeader: {
    marginBottom: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    marginTop: 16,
  },
});
