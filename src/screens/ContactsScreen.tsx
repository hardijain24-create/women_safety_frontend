import React, { useEffect, useState } from 'react';
import { View, Alert, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Input } from '../components/atoms/Input';
import { Chip } from '../components/atoms/Chip';
import { Toggle } from '../components/atoms/Toggle';
import { Icon } from '../components/atoms/Icon';
import { Skeleton } from '../components/atoms/Skeleton';
import { ContactCard } from '../components/molecules/ContactCard';
import { Card } from '../components/molecules/Card';
import { SearchBar } from '../components/molecules/SearchBar';
import { ScreenLayout, Header, BottomSheet } from '../components/organisms';
import { userApi } from '../api/services';
import type { EmergencyContact } from '../types';

export const ContactsScreen: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relation: 'Friend', // Default relationship
    isPrimary: false,
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
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
    let hasError = false;
    const errors = { name: '', phone: '' };

    if (!newContact.name.trim()) {
      errors.name = 'Name is required';
      hasError = true;
    }

    const sanitizedPhone = newContact.phone.replace(/\D/g, '');
    if (!newContact.phone) {
      errors.phone = 'Phone number is required';
      hasError = true;
    } else if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      errors.phone = 'Phone must be between 10 and 15 digits';
      hasError = true;
    }

    setFormErrors(errors);
    if (hasError) return;

    try {
      const response = await userApi.addContact({
        contact: {
          name: newContact.name.trim(),
          phone: sanitizedPhone,
          email: newContact.email.trim() || undefined,
          relation: newContact.relation.trim() || undefined,
          isPrimary: newContact.isPrimary,
        }
      });

      if (response.success) {
        setContacts(response.data.emergency_contacts);
        setNewContact({ name: '', phone: '', email: '', relation: 'Friend', isPrimary: false });
        setIsModalVisible(false);
        Alert.alert('Success', 'Contact added successfully');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add contact. Please check your network and try again.');
    }
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this contact from your emergency guardians list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
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

  // Filter & search logic
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          contact.phone.includes(searchQuery);
    
    if (activeFilter === 'All') return matchesSearch;
    
    // Check relationship matching
    const relationLower = (contact.relation || '').toLowerCase();
    const filterLower = activeFilter.toLowerCase();
    
    if (filterLower === 'family') {
      return matchesSearch && ['mother', 'father', 'sister', 'brother', 'son', 'daughter', 'husband', 'wife', 'parent', 'family'].includes(relationLower);
    }
    if (filterLower === 'friends') {
      return matchesSearch && ['friend', 'bestie', 'buddy'].includes(relationLower);
    }
    if (filterLower === 'work') {
      return matchesSearch && ['work', 'colleague', 'manager', 'boss', 'partner'].includes(relationLower);
    }
    
    return matchesSearch;
  });

  const relationPresets = ['Family', 'Friend', 'Work', 'Guardian', 'Doctor', 'Other'];
  const filterCategories = ['All', 'Family', 'Friends', 'Work'];

  const { theme } = useTheme();

  return (
    <ScreenLayout
      header={
        <Header
          title="Emergency Contacts"
          subtitle={`${contacts.length} registered guardians`}
          rightAction={{
            icon: 'add',
            onPress: () => setIsModalVisible(true),
          }}
        />
      }
      scrollable={true}
      safeArea={true}
    >
      <View style={{ paddingBottom: 32 }}>
        
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search contacts..."
        />

        {/* Filter Chips Scroll Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterCategories.map(category => {
            const isActive = activeFilter === category;
            return (
              <Chip
                key={category}
                label={category}
                selected={isActive}
                onPress={() => setActiveFilter(category)}
                variant="primary"
              />
            );
          })}
        </ScrollView>

        {/* Loading Indicator */}
        {loading ? (
          <View style={{ marginTop: 12, paddingHorizontal: 4 }}>
            <Skeleton variant="list" />
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            {/* Contacts Listing */}
            {filteredContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={() => handleDeleteContact(contact.id!)}
              />
            ))}

            {/* Empty Listing Placeholder */}
            {filteredContacts.length === 0 && (
              <Card variant="default" padding="large" style={styles.emptyCard}>
                <Icon 
                  name="contacts" 
                  size={48} 
                  color={theme.colors.textMuted} 
                  backgroundColor={theme.colors.backgroundSecondary}
                  containerStyle={{ marginBottom: 16 }}
                />
                <Typography variant="bodyLarge" color="primary" weight="700" align="center">
                  {contacts.length === 0 ? "No emergency contacts yet" : "No contacts found"}
                </Typography>
                <Typography variant="bodySmall" color="muted" align="center" style={{ marginTop: 8, maxWidth: 260, lineHeight: 18 }}>
                  {contacts.length === 0 
                    ? "Add trusted contacts to notify during emergencies." 
                    : "No contacts match your current search query or filter."}
                </Typography>
                {contacts.length === 0 && (
                  <Button 
                    title="Add Contact"
                    onPress={() => setIsModalVisible(true)}
                    variant="primary"
                    size="medium"
                    style={{ marginTop: 20, paddingHorizontal: 24 }}
                  />
                )}
              </Card>
            )}
          </View>
        )}
      </View>

      {/* Add Contact Slider Sheet */}
      <BottomSheet
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setFormErrors({ name: '', phone: '' });
        }}
        title="Add Guardian"
      >
        {/* Form Fields */}
        <Input
          label="Full Name"
          value={newContact.name}
          onChangeText={text => {
            setNewContact({ ...newContact, name: text });
            if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
          }}
          placeholder="Enter contact name"
          error={formErrors.name}
          variant="outlined"
        />
        <Input
          label="Phone Number"
          value={newContact.phone}
          onChangeText={text => {
            setNewContact({ ...newContact, phone: text });
            if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
          }}
          placeholder="Enter phone number (e.g. +1...)"
          keyboardType="phone-pad"
          error={formErrors.phone}
          variant="outlined"
        />
        <Input
          label="Email Address (Optional)"
          value={newContact.email}
          onChangeText={text => setNewContact({ ...newContact, email: text })}
          placeholder="Enter email address"
          keyboardType="email-address"
          variant="outlined"
        />

        {/* Primary Guardian Toggle */}
        <View style={{ marginVertical: 12, paddingHorizontal: 4 }}>
          <Toggle
            label="Mark as Primary Guardian"
            value={newContact.isPrimary}
            onValueChange={val => setNewContact({ ...newContact, isPrimary: val })}
            size="large"
          />
        </View>

        {/* Relationship Presets Selector */}
        <Typography variant="label" color="secondary" style={{ marginBottom: 8, marginLeft: 4, marginTop: 12 }}>
          Relationship
        </Typography>
        <View style={styles.presetsContainer}>
          {relationPresets.map(preset => {
            const isSelected = newContact.relation === preset;
            return (
              <Chip
                key={preset}
                label={preset}
                selected={isSelected}
                onPress={() => setNewContact({ ...newContact, relation: preset })}
                variant="primary"
              />
            );
          })}
        </View>

        {/* Submit Button */}
        <Button
          title="Save Guardian"
          onPress={handleAddContact}
          variant="primary"
          size="xlarge"
          style={{ marginTop: 24 }}
          fullWidth={true}
        />
      </BottomSheet>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 12,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
});
