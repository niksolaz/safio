import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', phone: '', email: '' });

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: user.email || '' // Email comes from Auth
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          updated_at: new Date(),
        });

      if (error) throw error;
      alert('Profilo aggiornato!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="page-container">
      <div className="nav-header" style={{ padding: '0 0 20px 0', border: 'none' }}>
        <ArrowLeft size={24} onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        <h2>Impostazioni</h2>
        <div style={{ width: 24 }}></div>
      </div>
      
      <div style={{ textAlign: 'left' }}>
        <p><strong>Configurazione Account</strong></p>
        
        <label style={{ fontSize: '0.9rem', color: '#666' }}>Nome Completo</label>
        <input 
          type="text" 
          placeholder="Il tuo Nome" 
          className="input-field" 
          value={profile.full_name}
          onChange={(e) => setProfile({...profile, full_name: e.target.value})}
        />
        
        <label style={{ fontSize: '0.9rem', color: '#666' }}>Il tuo Telefono</label>
        <input 
          type="tel" 
          placeholder="Il tuo numero" 
          className="input-field" 
          value={profile.phone}
          onChange={(e) => setProfile({...profile, phone: e.target.value})}
        />
        
        <label style={{ fontSize: '0.9rem', color: '#666' }}>Email (Account)</label>
        <input 
          type="email" 
          value={profile.email} 
          className="input-field" 
          disabled 
          style={{ background: '#eee' }}
        />
        
        <button 
          onClick={updateProfile}
          className="btn-safe"
          style={{ marginTop: '20px', width: '100%', backgroundColor: '#333' }}
          disabled={loading}
        >
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>

        <button 
          onClick={handleSignOut}
          style={{ marginTop: '40px', width: '100%', backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <LogOut size={18} />
          Esci
        </button>
      </div>
    </div>
  );
}
