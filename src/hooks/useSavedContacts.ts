import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Email-only saved recipients for Communications
export interface SavedContact {
  id: string;
  email: string;
  name?: string;
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

  // Save or update an email recipient
  const saveContact = useCallback(async (email: string, name?: string) => {
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
          })
          .eq('id', existingContact.id);

        if (error) throw error;
      } else {
        // Insert new email
        const { error } = await supabase
          .from('saved_contacts')
          .insert({
            user_id: user.id,
            email: email.toLowerCase(),
            name,
          });

        if (error) throw error;
      }

      await fetchContacts();
    } catch (err) {
      console.error('Error saving email:', err);
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

  // Export email list to CSV
  const exportEmailList = useCallback(() => {
    if (contacts.length === 0) {
      toast.error('No emails to export');
      return;
    }

    const csvHeader = 'email,name\n';
    const csvRows = contacts.map(c => 
      `"${c.email}","${c.name || ''}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email_list_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${contacts.length} emails`);
  }, [contacts]);

  // Import email list from CSV
  const importEmailList = useCallback(async (file: File): Promise<number> => {
    if (!user) return 0;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          // Skip header if present
          const startIndex = lines[0]?.toLowerCase().includes('email') ? 1 : 0;
          let importedCount = 0;

          for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            // Parse CSV line (handle quoted values)
            const matches = line.match(/("([^"]*)"|[^,]+)/g);
            if (!matches || matches.length < 1) continue;

            const email = matches[0]?.replace(/"/g, '').trim();
            const name = matches[1]?.replace(/"/g, '').trim() || undefined;

            if (email && email.includes('@')) {
              // Check if already exists
              const exists = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
              if (!exists) {
                const { error } = await supabase
                  .from('saved_contacts')
                  .insert({
                    user_id: user.id,
                    email: email.toLowerCase(),
                    name,
                  });
                if (!error) importedCount++;
              }
            }
          }

          await fetchContacts();
          toast.success(`Imported ${importedCount} new emails`);
          resolve(importedCount);
        } catch (err) {
          console.error('Import error:', err);
          toast.error('Failed to import email list');
          resolve(0);
        }
      };
      reader.readAsText(file);
    });
  }, [user, contacts, fetchContacts]);

  // Bulk save emails (for batch operations)
  const bulkSaveEmails = useCallback(async (emails: string[]) => {
    if (!user || emails.length === 0) return;

    for (const email of emails) {
      await saveContact(email);
    }
  }, [user, saveContact]);

  return {
    contacts,
    loading,
    saveContact,
    searchContacts,
    deleteContact,
    exportEmailList,
    importEmailList,
    bulkSaveEmails,
    refetch: fetchContacts,
  };
}
