import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Badge } from '../components/atoms/Badge';
import { AlertCard } from '../components/molecules/AlertCard';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { mockAlerts } from '../constants';

export const AlertsScreen: React.FC = () => {
  const { theme } = useTheme();
  const unreadCount = mockAlerts.filter(a => !a.isRead).length;

  const criticalCount = mockAlerts.filter(a => a.severity === 'critical').length;
  const highCount = mockAlerts.filter(a => a.severity === 'high').length;

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

        <View style={{ gap: 12 }}>
          {mockAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </View>

        {/* Empty State */}
        {mockAlerts.length === 0 && (
          <Card variant="outlined" padding="large" style={{ alignItems: 'center' }}>
            <Typography variant="body" color="muted" align="center">
              No alerts yet. Stay safe!
            </Typography>
          </Card>
        )}
      </View>
    </ScreenLayout>
  );
};
