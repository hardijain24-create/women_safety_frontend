import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
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

  return (
    <Card variant="default" padding="medium">
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.colors.navy + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Icon name="contacts" size={28} color={theme.colors.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Typography variant="bodyLarge" color="primary" weight="600">
                {contact.name}
              </Typography>
              {contact.isPrimary && (
                <View style={{ marginLeft: 8 }}>
                  <Badge label="Primary" variant="gold" size="small" />
                </View>
              )}
            </View>
            <Typography variant="bodySmall" color="muted">
              {contact.relation}
            </Typography>
            <Typography variant="body" color="secondary" style={{ marginTop: 4 }}>
              {contact.phone}
            </Typography>
          </View>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={{ padding: 8 }}>
              <Icon name="delete" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};
