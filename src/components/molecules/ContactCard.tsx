import React from 'react';
import { View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Avatar } from '../atoms/Avatar';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Card } from './Card';
import type { EmergencyContact } from '../../types';
import { showAlert } from '../../utils/alert';

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
        showAlert('Error', 'Unable to initiate call.');
      });
    }
  };

  const handleSms = () => {
    if (contact.phone) {
      Linking.openURL(`sms:${contact.phone}`).catch(() => {
        showAlert('Error', 'Unable to open messaging app.');
      });
    }
  };

  return (
    <Card 
      variant={onPress ? "interactive" : "default"} 
      padding="medium"
      onPress={onPress}
      style={{ 
        marginBottom: theme.layout.cardGap,
        ...(contact.isPrimary ? {
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.primary,
        } : {})
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Avatar Component */}
        <Avatar 
          name={contact.name} 
          size="md" 
          borderColor={contact.isPrimary ? theme.colors.primary : undefined}
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
              style={{ maxWidth: '80%' }}
            >
              {contact.name}
            </Typography>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
            {contact.isPrimary ? (
              <View style={{ marginRight: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Badge label="PRIMARY" variant="success" size="small" />
                {contact.relation && (
                  <Badge label={contact.relation} variant="neutral" size="small" />
                )}
              </View>
            ) : (
              contact.relation && (
                <View style={{ marginRight: 4 }}>
                  <Badge label={contact.relation} variant="neutral" size="small" />
                </View>
              )
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
                style={[styles.actionButton, { backgroundColor: theme.colors.backgroundSecondary }]}
                accessibilityLabel={`Call ${contact.name}`}
                accessibilityRole="button"
              >
                <Icon name="phone" size="sm" color={theme.colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSms} 
                style={[styles.actionButton, { backgroundColor: theme.colors.backgroundSecondary }]}
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
