import React, { useEffect, useState } from 'react';
import { View, Alert, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { IconButton } from '../components/atoms/IconButton';
import { Input } from '../components/atoms/Input';
import { ContactCard } from '../components/molecules/ContactCard';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { userApi } from '../api/services';
import type { EmergencyContact } from '../types';

export const ContactsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relation: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await userApi.getProfile();
      if (response.success && response.data.emergency_contacts) {
        setContacts(response.data.emergency_contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Alert.alert('Error', 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    // Basic validation
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Name and phone are required');
      return;
    }

    // Sanitize phone number (remove spaces, dashes, etc.)
    const sanitizedPhone = newContact.phone.replace(/\D/g, '');

    // Strict validation feedback to match backend
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      Alert.alert('Invalid Phone', 'Phone number must be between 10 and 15 digits.');
      return;
    }

    try {
      const response = await userApi.addContact({
        contact: {
          name: newContact.name.trim(),
          phone: sanitizedPhone, // already sanitized
          email: newContact.email.trim() || undefined,
          relation: newContact.relation.trim() || undefined,
        }
      });

      if (response.success) {
        setContacts(response.data.emergency_contacts);
        setNewContact({ name: '', phone: '', email: '', relation: '' });
        setIsModalVisible(false);
        Alert.alert('Success', 'Contact added successfully');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add contact. Please ensure the phone number is valid.');
    }
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
          onPress: async () => {
            try {
              const response = await userApi.deleteContact(id);
              if (response.success) {
                setContacts(response.data.emergency_contacts);
              }
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenLayout
        header={<Header title="Emergency Contacts" subtitle="Loading..." />}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

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
        {/* Contacts List */}
        <View style={{ gap: 12 }}>
          {contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={() => handleDeleteContact(contact.id!)}
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
