import React from 'react';
import { View, TouchableOpacity, Linking, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Avatar } from '../atoms/Avatar';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Card } from './Card';
import type { EmergencyContact } from '../../types';

interface ContactCardProps {
  contact: EmergencyContact;
  onPress?: () => void;
  onDelete?: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onPress,
  onDelete,
}) => {
  const { theme } = useTheme();



  const handleCall = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`).catch(() => {
        Alert.alert('Error', 'Unable to initiate call.');
      });
    }
  };

  const handleSms = () => {
    if (contact.phone) {
      Linking.openURL(`sms:${contact.phone}`).catch(() => {
        Alert.alert('Error', 'Unable to open messaging app.');
      });
    }
  };

  const isDark = theme.isDark;

  return (
    <Card 
      variant={onPress ? "interactive" : "default"} 
      padding="medium"
      onPress={onPress}
      style={{ marginBottom: theme.layout.cardGap }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Avatar Component */}
        <Avatar 
          name={contact.name} 
          size="md" 
          style={{ marginRight: theme.layout.cardGap }} 
        />

        {/* Contact Details */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Typography 
              variant="bodyLarge" 
              color="primary" 
              weight="600"
              numberOfLines={1}
              style={{ maxWidth: '65%' }}
            >
              {contact.name}
            </Typography>
            {contact.isPrimary && (
              <View style={{ marginLeft: 8 }}>
                <Badge label="Primary" variant="primary" size="small" />
              </View>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            {contact.relation && (
              <View style={{ marginRight: 8 }}>
                <Badge label={contact.relation} variant="neutral" size="small" />
              </View>
            )}
            <Typography variant="bodySmall" color="secondary">
              {contact.phone}
            </Typography>
          </View>
        </View>

        {/* Quick Actions & Delete */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {contact.phone && (
            <>
              <TouchableOpacity 
                onPress={handleCall} 
                style={[styles.actionButton, { backgroundColor: isDark ? '#161B18' : '#F3F4F6' }]}
                accessibilityLabel={`Call ${contact.name}`}
                accessibilityRole="button"
              >
                <Icon name="phone" size="sm" color={theme.colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSms} 
                style={[styles.actionButton, { backgroundColor: isDark ? '#161B18' : '#F3F4F6' }]}
                accessibilityLabel={`Send message to ${contact.name}`}
                accessibilityRole="button"
              >
                <Icon name="message" size="sm" color={theme.colors.primary} />
              </TouchableOpacity>
            </>
          )}
          
          {onDelete && (
            <TouchableOpacity 
              onPress={onDelete} 
              style={[styles.actionButton, { backgroundColor: theme.colors.error + '10' }]}
              accessibilityLabel={`Delete ${contact.name}`}
              accessibilityRole="button"
            >
              <Icon name="delete" size="sm" color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
