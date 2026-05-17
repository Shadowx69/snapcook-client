import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../../api/client';
import Toast from '../../components/Toast';

function PwField({ label, field, form, setForm, errors, setErrors, show, setShow }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: null })); }}
          style={{
            width: '100%', padding: '12px 44px 12px 38px',
            borderRadius: 'var(--radius-sm)',
            border: `1.5px solid ${errors[field] ? 'var(--color-error)' : 'var(--color-border)'}`,
            background: 'var(--color-surface)',
            fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)',
            color: 'var(--color-text)', outline: 'none',
            transition: 'border-color 0.15s', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = errors[field] ? 'var(--color-error)' : 'var(--color-border)'}
        />
        <button
          type="button"
          onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex' }}
        >
          {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[field] && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 4 }}>{errors[field]}</p>}
    </div>
  );
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);

  function validate() {
    const errs = {};
    if (!form.current) errs.current = 'Enter your current password';
    if (!form.next) errs.next = 'Enter a new password';
    if (form.next !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    try {
      await api.post('/auth/change-password', { currentPassword: form.current, newPassword: form.next });
      setToast('Password updated');
      setTimeout(() => navigate('/settings'), 1200);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('wrong')) {
        setErrors({ current: 'Current password is incorrect' });
      } else {
        setToast(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 40 }}>

      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <button onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>Change Password</h1>
        <div style={{ width: 38 }} />
      </div>

      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px 16px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <PwField label="Current Password" field="current" form={form} setForm={setForm} errors={errors} setErrors={setErrors} show={show} setShow={setShow} />
          <PwField label="New Password" field="next" form={form} setForm={setForm} errors={errors} setErrors={setErrors} show={show} setShow={setShow} />
          <PwField label="Confirm New Password" field="confirm" form={form} setForm={setForm} errors={errors} setErrors={setErrors} show={show} setShow={setShow} />
        </div>

        <button onClick={handleSave} disabled={busy} className="btn btn-primary btn-lg" style={{ width: '100%', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Updating…' : 'Update Password'}
        </button>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
