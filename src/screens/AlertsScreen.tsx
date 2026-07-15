import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Chip } from '../components/atoms/Chip';
import { Loader } from '../components/atoms/Loader';
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

  // Grouping logic: Today vs This Week
  const todayAlerts: AlertItem[] = [];
  const thisWeekAlerts: AlertItem[] = [];

  filteredAlerts.forEach(alert => {
    const time = alert.timestamp.toLowerCase();
    if (time.includes('today') || time.includes('min ago') || time.includes('hour ago')) {
      todayAlerts.push(alert);
    } else {
      thisWeekAlerts.push(alert);
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
          <Loader text="Syncing safety records..." />
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

                {/* This Week's Section */}
                {thisWeekAlerts.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Typography variant="label" color="secondary" style={styles.sectionHeader}>
                      THIS WEEK
                    </Typography>
                    {thisWeekAlerts.map(alert => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </View>
                )}
              </>
            ) : (
              /* Empty History Placeholder */
              <Card variant="default" padding="large" style={styles.emptyCard}>
                <Icon
                  name="alerts"
                  size={48}
                  color={theme.colors.textMuted}
                  backgroundColor={theme.colors.backgroundSecondary}
                  containerStyle={{ marginBottom: 16 }}
                />
                <Typography variant="bodyLarge" color="primary" weight="600" align="center">
                  All clear. No logs found.
                </Typography>
                <Typography variant="bodySmall" color="muted" align="center" style={{ marginTop: 6, maxWidth: 240 }}>
                  {activeFilter === 'All' 
                    ? "Your safety tracking is active. Trigger events will be logged here." 
                    : "No warning logs found matching your selected severity level."}
                </Typography>
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
