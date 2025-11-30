import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Contacts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{
          user_id: user.id,
          name: newContact.name,
          phone: newContact.phone,
          email: newContact.email
        }]);

      if (error) throw error;
      
      setNewContact({ name: '', phone: '', email: '' });
      setShowAdd(false);
      fetchContacts();
    } catch (error) {
      alert('Error adding contact: ' + error.message);
    }
  };

  const deleteContact = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo contatto?')) return;
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchContacts();
    } catch (error) {
      alert('Error deleting contact: ' + error.message);
    }
  };

  return (
    <div className="page-container">
      <div className="nav-header" style={{ padding: '0 0 20px 0', border: 'none' }}>
        <ArrowLeft size={24} onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        <h2>Contatti di Emergenza</h2>
        <Plus size={24} onClick={() => setShowAdd(!showAdd)} style={{ cursor: 'pointer' }} />
      </div>
      
      {showAdd && (
        <form onSubmit={addContact} style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
          <input
            type="text"
            placeholder="Nome"
            className="input-field"
            value={newContact.name}
            onChange={(e) => setNewContact({...newContact, name: e.target.value})}
            required
          />
          <input
            type="tel"
            placeholder="Telefono"
            className="input-field"
            value={newContact.phone}
            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email (opzionale)"
            className="input-field"
            value={newContact.email}
            onChange={(e) => setNewContact({...newContact, email: e.target.value})}
          />
          <button type="submit" className="btn-safe" style={{ width: '100%', marginTop: '10px' }}>Salva Contatto</button>
        </form>
      )}
      
      <div style={{ textAlign: 'left', flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <p>Caricamento...</p>
        ) : contacts.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>Nessun contatto. Aggiungine uno con il tasto +</p>
        ) : (
          contacts.map(contact => (
            <div key={contact.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{contact.name}</strong>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>{contact.phone}</div>
                {contact.email && <div style={{ fontSize: '0.8rem', color: '#999' }}>{contact.email}</div>}
              </div>
              <Trash2 size={20} color="#ff4444" onClick={() => deleteContact(contact.id)} style={{ cursor: 'pointer' }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
