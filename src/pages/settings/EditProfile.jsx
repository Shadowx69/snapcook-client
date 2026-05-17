import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import Toast from '../../components/Toast';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

const AVATAR_COLORS = [
  '#C84B31', '#4A7C59', '#D4956A', '#5A7FA8', '#A33A70', '#C87B1A',
  '#6A3A9A', '#2A7A8A', '#8A3A3A', '#3A6A3A',
];

function Field({ label, field, placeholder, multiline, keyboardType, form, setForm, errors, setErrors }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={form[field]}
          onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: null })); }}
          placeholder={placeholder}
          rows={3}
          style={{
            width: '100%', padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: `1.5px solid ${errors[field] ? 'var(--color-error)' : 'var(--color-border)'}`,
            background: 'var(--color-surface)',
            fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
            resize: 'none', outline: 'none',
            transition: 'border-color 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = errors[field] ? 'var(--color-error)' : 'var(--color-border)'}
        />
      ) : (
        <input
          type={keyboardType || 'text'}
          value={form[field]}
          onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: null })); }}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: `1.5px solid ${errors[field] ? 'var(--color-error)' : 'var(--color-border)'}`,
            background: 'var(--color-surface)',
            fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)',
            color: 'var(--color-text)', outline: 'none',
            transition: 'border-color 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = errors[field] ? 'var(--color-error)' : 'var(--color-border)'}
        />
      )}
      {errors[field] && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 4 }}>{errors[field]}</p>}
    </div>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const { user, refreshUser } = useAuth();
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarImg, setAvatarImg] = useState(user?.avatarImg || null);
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#C84B31');
  const [form, setForm] = useState({
    name: user?.displayName || '',
    username: '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarImg(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    if (form.username.includes(' ')) errs.username = 'Username cannot contain spaces';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await usersApi.updateMe({ 
        displayName: form.name, 
        username: form.username, 
        avatarColor, 
        avatarImg: avatarImg || '' 
      });
      if (refreshUser) await refreshUser();
      setToast('Profile saved');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }



  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>Edit Profile</h1>
        <button
          onClick={handleSave}
          style={{
            padding: '8px 18px', borderRadius: 'var(--radius-xs)',
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Check size={15} /> Save
        </button>
      </div>

      {/* Avatar section */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '28px 16px', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: avatarImg ? 'transparent' : avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, color: '#fff',
            boxShadow: 'var(--shadow-md)',
            border: '4px solid var(--color-surface)',
            overflow: 'hidden',
          }}>
            {avatarImg
              ? <img src={avatarImg} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : form.name.charAt(0).toUpperCase()
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--color-primary)', color: '#fff',
              border: '2px solid var(--color-surface)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 280, margin: '0 auto' }}>
          {AVATAR_COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setAvatarColor(c); setAvatarImg(null); }}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: c, border: 'none', cursor: 'pointer',
                outline: avatarColor === c && !avatarImg ? `3px solid ${c}` : '3px solid transparent',
                outlineOffset: 2, transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            />
          ))}
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 10 }}>
          Tap the camera to upload a photo, or pick a colour
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: '24px 16px 0' }}>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px 16px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Personal Info</p>
          <Field label="Full Name" field="name" placeholder="Your full name" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
          <Field label="Username" field="username" placeholder="e.g. rafaycooks" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
          <Field label="Email" field="email" placeholder="you@example.com" keyboardType="email" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          Save Changes
        </button>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
