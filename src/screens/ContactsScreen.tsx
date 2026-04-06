import React, { useState } from 'react';
import { View, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { IconButton } from '../components/atoms/IconButton';
import { Input } from '../components/atoms/Input';
import { ContactCard } from '../components/molecules/ContactCard';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { mockEmergencyContacts } from '../constants';
import type { EmergencyContact } from '../types';

export const ContactsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>(mockEmergencyContacts);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relation: '',
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Name and phone are required');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email,
      relation: newContact.relation || 'Contact',
      isPrimary: false,
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: '', phone: '', email: '', relation: '' });
    setIsModalVisible(false);
    Alert.alert('Success', 'Contact added successfully');
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setContacts(contacts.filter(c => c.id !== id));
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout
      header={
        <Header
          title="Emergency Contacts"
          subtitle={`${contacts.length} contacts`}
          rightAction={{
            icon: 'add',
            onPress: () => setIsModalVisible(true),
          }}
        />
      }
    >
      <View style={{ paddingBottom: 32 }}>
        {/* Primary Contact Highlight */}
        {contacts.find(c => c.isPrimary) && (
          <Card
            variant="elevated"
            padding="large"
            style={{ marginBottom: 24, backgroundColor: theme.colors.gold + '15' }}
          >
            <Typography variant="bodySmall" color="gold" weight="600" style={{ marginBottom: 8 }}>
              PRIMARY CONTACT
            </Typography>
            <Typography variant="h4" color="primary">
              {contacts.find(c => c.isPrimary)?.name}
            </Typography>
            <Typography variant="body" color="secondary">
              {contacts.find(c => c.isPrimary)?.phone}
            </Typography>
          </Card>
        )}

        {/* Contacts List */}
        <View style={{ gap: 12 }}>
          {contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={() => handleDeleteContact(contact.id)}
            />
          ))}
        </View>

        {/* Empty State */}
        {contacts.length === 0 && (
          <Card variant="outlined" padding="large" style={{ alignItems: 'center' }}>
            <Typography variant="body" color="muted" align="center">
              No emergency contacts yet. Add your first contact to get started.
            </Typography>
          </Card>
        )}
      </View>

      {/* Add Contact Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              paddingBottom: 48,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Typography variant="h3" color="primary">
                Add Contact
              </Typography>
              <IconButton
                icon="close"
                onPress={() => setIsModalVisible(false)}
                size="medium"
              />
            </View>

            <Input
              label="Name"
              value={newContact.name}
              onChangeText={text => setNewContact({ ...newContact, name: text })}
              placeholder="Enter contact name"
            />
            <Input
              label="Phone Number"
              value={newContact.phone}
              onChangeText={text => setNewContact({ ...newContact, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <Input
              label="Email (Optional)"
              value={newContact.email}
              onChangeText={text => setNewContact({ ...newContact, email: text })}
              placeholder="Enter email address"
              keyboardType="email-address"
            />
            <Input
              label="Relationship (Optional)"
              value={newContact.relation}
              onChangeText={text => setNewContact({ ...newContact, relation: text })}
              placeholder="e.g., Daughter, Son, Doctor"
            />

            <Button
              title="Add Contact"
              onPress={handleAddContact}
              variant="primary"
              size="xlarge"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
};
