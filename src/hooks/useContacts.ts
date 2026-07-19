import { useState, useEffect } from 'react';
import { userApi } from '../api/services';
import type { EmergencyContact } from '../types';

export const useContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await userApi.getProfile();
      if (response.success && response.data.emergency_contacts) {
        setContacts(response.data.emergency_contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts in hook:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const addContact = async (contact: Partial<EmergencyContact>) => {
    setLoading(true);
    try {
      const response = await userApi.addContact({ contact });
      if (response.success) {
        setContacts(response.data.emergency_contacts);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: string) => {
    setLoading(true);
    try {
      const response = await userApi.deleteContact(id);
      if (response.success) {
        setContacts(response.data.emergency_contacts);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAlphabeticalGroups = () => {
    const filtered = contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);

      if (activeFilter === 'All') return matchesSearch;

      const relationLower = (c.relation || '').toLowerCase();
      const filterLower = activeFilter.toLowerCase();

      if (filterLower === 'family') {
        return (
          matchesSearch &&
          ['mother', 'father', 'sister', 'brother', 'son', 'daughter', 'husband', 'wife', 'parent', 'family'].includes(relationLower)
        );
      }
      if (filterLower === 'friends') {
        return matchesSearch && ['friend', 'bestie', 'buddy'].includes(relationLower);
      }
      if (filterLower === 'work') {
        return matchesSearch && ['work', 'colleague', 'manager', 'boss', 'partner'].includes(relationLower);
      }
      return matchesSearch;
    });

    const groups: { [key: string]: EmergencyContact[] } = {};
    filtered.forEach((contact) => {
      const letter = contact.name.trim().charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(contact);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((key) => ({
      title: key,
      data: groups[key],
    }));
  };

  return {
    contacts,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    addContact,
    deleteContact,
    fetchContacts,
    getAlphabeticalGroups,
  };
};
