import PropTypes from 'prop-types';
import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Camera, User, Phone, Calendar, MapPin, AlertCircle } from 'lucide-react';

export default function CreateProfile({ setCurrentTab, navigate }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'); // default avatar
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !dob || !address) {
      setError('Please fill in all details to create your profile.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await updateProfile({
      name,
      phone,
      dob,
      gender,
      address,
      avatarUrl
    });

    setLoading(false);

    if (res.success) {
      if (navigate) {
        navigate('profile-success', 'Configuring account...');
      } else {
        setCurrentTab('profile-success');
      }
    } else {
      setError(res.message || 'Failed to update profile details.');
    }
  };

  const handleAvatarSelect = () => {
    const customUrl = window.prompt('Enter an image URL for your profile avatar:', avatarUrl);
    if (customUrl) {
      setAvatarUrl(customUrl);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h2>Create Your Profile</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tell us more about yourself</p>
        </div>

        {error && (
          <div className="auth-msg auth-msg-error">
            <AlertCircle size={16} style={{ marginRight: '8px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload Placeholder */}
          <div className="avatar-upload-container">
            <div className="avatar-preview" onClick={handleAvatarSelect} title="Click to change avatar URL">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" />
              ) : (
                <Camera size={24} style={{ color: 'var(--text-light)' }} />
              )}
            </div>
            <span className="avatar-preview-text" style={{ cursor: 'pointer', color: 'var(--color-primary)' }} onClick={handleAvatarSelect}>
              Upload Photo
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="profile-name" className="neon-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
              <input 
                id="profile-name"
                type="text" 
                className="neon-input" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="profile-phone" className="neon-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
              <input 
                id="profile-phone"
                type="tel" 
                className="neon-input" 
                placeholder="+91 98765 43210" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label htmlFor="profile-dob" className="neon-label">Date of Birth</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
                <input 
                  id="profile-dob"
                  type="date" 
                  className="neon-input" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-gender" className="neon-label">Gender</label>
              <select 
                id="profile-gender"
                className="neon-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="profile-address" className="neon-label">Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
              <input 
                id="profile-address"
                type="text" 
                className="neon-input" 
                placeholder="Hyderabad, Telangana, India" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-purple" 
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Saving details...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

CreateProfile.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
  navigate: PropTypes.func,
};
