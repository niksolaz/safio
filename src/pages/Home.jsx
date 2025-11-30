import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Loader2 } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleAction = async (type) => {
    if (sending) return;
    setSending(true);
    setStatusMessage('Acquisizione posizione...');

    try {
      // 1. Get Location
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;

      setStatusMessage('Recupero contatti...');
      
      // 2. Get Contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      if (!contacts || contacts.length === 0) {
        alert('Nessun contatto di emergenza configurato! Vai in Contatti per aggiungerne uno.');
        setSending(false);
        setStatusMessage('');
        return;
      }

      // 3. Get User Profile (for name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setStatusMessage('Invio segnalazione...');

      // 4. Send to n8n Webhook
      // TODO: Replace with actual n8n webhook URL from environment variables
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.warn('VITE_N8N_WEBHOOK_URL not set. Mocking success.');
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        const payload = {
          type,
          user: {
            id: user.id,
            name: profile?.full_name || user.email,
            email: user.email
          },
          location: {
            latitude,
            longitude,
            maps_link: `https://www.google.com/maps?q=${latitude},${longitude}`
          },
          contacts: contacts,
          timestamp: new Date().toISOString()
        };

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Errore invio webhook');
      }

      alert(`Segnale ${type} inviato con successo a ${contacts.length} contatti.`);

    } catch (error) {
      console.error('Error sending signal:', error);
      alert('Errore durante l\'invio: ' + error.message);
    } finally {
      setSending(false);
      setStatusMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="nav-header">
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Safety App</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Users size={24} onClick={() => navigate('/contacts')} style={{ cursor: 'pointer' }} />
          <Settings size={24} onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }} />
        </div>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {sending && (
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(255,255,255,0.8)', zIndex: 10, 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Loader2 className="animate-spin" size={48} color="#333" />
            <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{statusMessage}</p>
          </div>
        )}

        <button 
          className="btn-large btn-safe"
          onClick={() => handleAction('CONFERMA')}
          style={{ flex: 1 }}
          disabled={sending}
        >
          CONFERMO
          <span style={{ fontSize: '1rem', fontWeight: 'normal', marginTop: '5px' }}>Sto bene</span>
        </button>
        
        <button 
          className="btn-large btn-warning"
          onClick={() => handleAction('AIUTO')}
          style={{ flex: 1 }}
          disabled={sending}
        >
          AIUTO
          <span style={{ fontSize: '1rem', fontWeight: 'normal', marginTop: '5px' }}>Ho bisogno di assistenza</span>
        </button>
        
        <button 
          className="btn-large btn-danger"
          onClick={() => handleAction('PERICOLO')}
          style={{ flex: 1 }}
          disabled={sending}
        >
          PERICOLO
          <span style={{ fontSize: '1rem', fontWeight: 'normal', marginTop: '5px' }}>Emergenza immediata</span>
        </button>
      </div>
    </div>
  );
}
