import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { Card } from '../molecules/Card';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {

  return (
    <View style={styles.container}>
      <Typography 
        variant="label" 
        color="secondary" 
        style={styles.title}
        weight="700"
      >
        {title.toUpperCase()}
      </Typography>
      <Card variant="default" padding="medium">
        <View style={styles.list}>
          {children}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  title: {
    marginBottom: 8,
    marginLeft: 6,
    letterSpacing: 0.8,
  },
  list: {
    width: '100%',
  },
});
