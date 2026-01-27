import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SavedContact {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  use_count: number;
  last_used_at: string;
}

export function useSavedContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved contacts
  const fetchContacts = useCallback(async () => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('use_count', { ascending: false })
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching saved contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Save or update a contact (upsert)
  const saveContact = useCallback(async (email: string, name?: string, phone?: string) => {
    if (!user || !email) return;

    const existingContact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());

    try {
      if (existingContact) {
        // Update use_count and last_used_at
        const { error } = await supabase
          .from('saved_contacts')
          .update({
            use_count: existingContact.use_count + 1,
            last_used_at: new Date().toISOString(),
            name: name || existingContact.name,
            phone: phone || existingContact.phone,
          })
          .eq('id', existingContact.id);

        if (error) throw error;
      } else {
        // Insert new contact
        const { error } = await supabase
          .from('saved_contacts')
          .insert({
            user_id: user.id,
            email: email.toLowerCase(),
            name,
            phone,
          });

        if (error) throw error;
      }

      await fetchContacts();
    } catch (err) {
      console.error('Error saving contact:', err);
    }
  }, [user, contacts, fetchContacts]);

  // Search contacts by email or name
  const searchContacts = useCallback((query: string): SavedContact[] => {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return contacts.filter(c => 
      c.email.toLowerCase().includes(lowerQuery) ||
      (c.name && c.name.toLowerCase().includes(lowerQuery))
    );
  }, [contacts]);

  // Delete a saved contact
  const deleteContact = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  }, [user, fetchContacts]);

  return {
    contacts,
    loading,
    saveContact,
    searchContacts,
    deleteContact,
    refetch: fetchContacts,
  };
}
