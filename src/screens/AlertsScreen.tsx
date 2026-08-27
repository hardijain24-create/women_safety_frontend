import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Badge } from '../components/atoms/Badge';
import { AlertCard } from '../components/molecules/AlertCard';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { alertApi } from '../api/services';
import type { AlertItem } from '../types';

export const AlertsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await alertApi.getAlerts();
      if (response && response.success && Array.isArray(response.data)) {
        const mappedAlerts: AlertItem[] = response.data.map((a: any) => ({
          id: String(a._id || a.id),
          type: 'sos',
          title: 'SOS Emergency Alert',
          message: `Location: ${Number(a.latitude).toFixed(4)}, ${Number(a.longitude).toFixed(4)} - Status: ${a.status}`,
          timestamp: String(a.created_at || new Date().toISOString()),
          isRead: a.status === 'resolved',
          severity: a.status === 'active' ? 'critical' : 'high',
        }));
        setAlerts(mappedAlerts);
      }
    } catch (e) {
      console.log('Failed to fetch alerts', e);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = alerts.filter((a: AlertItem) => !a.isRead).length;
  const criticalCount = alerts.filter((a: AlertItem) => a.severity === 'critical').length;
  const highCount = alerts.filter((a: AlertItem) => a.severity === 'high').length;

  return (
    <ScreenLayout
      header={
        <Header
          title="Alerts"
          subtitle={`${unreadCount} unread`}
        />
      }
    >
      <View style={{ paddingBottom: 32 }}>
        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <Card variant="glass" padding="medium" style={{ flex: 1 }}>
            <Typography variant="h2" color="muted" align="center">
              {criticalCount}
            </Typography>
            <Typography variant="caption" color="muted" align="center">
              Critical
            </Typography>
          </Card>
          <Card variant="glass" padding="medium" style={{ flex: 1 }}>
            <Typography variant="h2" color="muted" align="center">
              {highCount}
            </Typography>
            <Typography variant="caption" color="muted" align="center">
              High Priority
            </Typography>
          </Card>
          <Card variant="glass" padding="medium" style={{ flex: 1 }}>
            <Typography variant="h2" color="gold" align="center">
              {unreadCount}
            </Typography>
            <Typography variant="caption" color="muted" align="center">
              Unread
            </Typography>
          </Card>
        </View>

        {/* Filter Tags */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <Badge label="All" variant="primary" size="medium" />
          <Badge label="SOS" variant="error" size="medium" />
          <Badge label="Band" variant="warning" size="medium" />
          <Badge label="Check-in" variant="success" size="medium" />
          <Badge label="System" variant="neutral" size="medium" />
        </View>

        {/* Alerts List */}
        <Typography variant="h4" color="primary" style={{ marginBottom: 16 }}>
          Recent Alerts
        </Typography>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.gold} style={{ marginTop: 24 }} />
        ) : (
          <View style={{ gap: 12 }}>
            {alerts.length > 0 ? (
              alerts.map((alert: AlertItem) => (
                <AlertCard key={alert.id} alert={alert} />
              ))
            ) : (
              <Card variant="outlined" padding="large" style={{ alignItems: 'center' }}>
                <Typography variant="body" color="muted" align="center">
                  No alerts yet. Stay safe!
                </Typography>
              </Card>
            )}
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};
