import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SectionList, AccessibilityInfo } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme';
import { Button, Typography, Input, Icon, Toggle } from '../../components/atoms';
import { Card, SearchBar, ContactCard } from '../../components/molecules';
import { ScreenLayout, Header, BottomSheet } from '../../components/organisms';
import { useContacts } from '../../hooks/useContacts';
import { showAlert } from '../../utils/alert';
import { EmergencyContact } from '../../types';

export const ContactsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  
  const {
    loading,
    searchQuery,
    setSearchQuery,
    addContact,
    deleteContact,
    getAlphabeticalGroups,
  } = useContacts();

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [latitudeStr, setLatitudeStr] = useState('');
  const [longitudeStr, setLongitudeStr] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Name and Phone number are required.');
      return;
    }
    setErrorMsg('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    
    const contactData: Partial<EmergencyContact> = {
      name: name.trim(),
      phone: phone.trim().replace(/\D/g, ''),
      relation: 'Guardian',
      isPrimary,
    };

    if (latitudeStr.trim()) {
      const latVal = parseFloat(latitudeStr.trim());
      if (isNaN(latVal)) {
        setErrorMsg('Invalid latitude value.');
        return;
      }
      contactData.latitude = latVal;
    }

    if (longitudeStr.trim()) {
      const lonVal = parseFloat(longitudeStr.trim());
      if (isNaN(lonVal)) {
        setErrorMsg('Invalid longitude value.');
        return;
      }
      contactData.longitude = lonVal;
    }

    const success = await addContact(contactData);

    if (success) {
      setName('');
      setPhone('');
      setLatitudeStr('');
      setLongitudeStr('');
      setIsPrimary(false);
      setIsModalOpen(false);
      showAlert('Success', 'Emergency contact added.');
    }
  };

  const handleDelete = (id: string, contactName: string) => {
    showAlert('Remove Contact', `Are you sure you want to remove ${contactName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          await deleteContact(id);
        },
      },
    ]);
  };

  const sections = getAlphabeticalGroups();

  return (
    <ScreenLayout
      header={
        <Header
          title="Emergency Contacts"
          subtitle="Trusted guardians list"
          rightAction={{
            icon: 'add',
            onPress: () => setIsModalOpen(true),
          }}
        />
      }
      scrollable={false}
      safeArea
    >
      <View style={{ flex: 1, paddingBottom: 16 }}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search guardians..." />

        {loading && sections.length === 0 ? (
          <Typography variant="bodySmall" color="muted" align="center" style={{ marginTop: 24 }}>
            Loading contacts list...
          </Typography>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title } }) => (
              <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
                <Typography variant="caption" color="muted" weight="600" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  {title}
                </Typography>
              </View>
            )}

            renderItem={({ item, index }) => (
              <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(index * 40).duration(200)}>
                <ContactCard
                  contact={item}
                  onDelete={() => handleDelete(item.id, item.name)}
                />
              </Animated.View>
            )}
            ListEmptyComponent={() => (
              <Card variant="glass" padding="medium" style={styles.emptyCard}>
                <Icon name="contacts" size={36} color={theme.colors.textMuted} containerStyle={{ marginBottom: 12 }} />
                <Typography variant="bodySmall" color="secondary" align="center">
                  No guardians registered. Click "+" to add a contact.
                </Typography>
              </Card>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add Contact Slider */}
      <BottomSheet isVisible={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setErrorMsg('');
      }} title="New Guardian">
        <View style={{ paddingBottom: 24 }}>
          {errorMsg ? <Typography variant="caption" color="error" style={{ marginBottom: 8 }}>{errorMsg}</Typography> : null}
          <Input label="Name" value={name} onChangeText={setName} placeholder="John Doe" variant="outlined" />
          <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" variant="outlined" />
          <Input label="Latitude (Optional)" value={latitudeStr} onChangeText={setLatitudeStr} placeholder="e.g. 23.0225" keyboardType="numeric" variant="outlined" />
          <Input label="Longitude (Optional)" value={longitudeStr} onChangeText={setLongitudeStr} placeholder="e.g. 72.5714" keyboardType="numeric" variant="outlined" />
          <View style={styles.toggleRow}>
            <Toggle label="Set as Primary Guardian" value={isPrimary} onValueChange={setIsPrimary} size="large" />
          </View>
          <Button title="Save Guardian" onPress={handleAdd} variant="primary" size="large" fullWidth style={{ marginTop: 12 }} />
        </View>
      </BottomSheet>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  contactCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  contactCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  contactInfo: {
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 16,
  },
  toggleRow: {
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingVertical: 12,
  },
});
