import { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

// Live camera modal using navigator.mediaDevices.getUserMedia.
// On open: requests the rear camera (facingMode: 'environment'), streams to a <video>,
// and emits a JPEG File via onCapture when the user taps the shutter.
// Requires a secure context (HTTPS or localhost) per browser security rules.
export default function CameraCapture({ open, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);
  const [facing, setFacing] = useState('environment');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    function stopCurrentStream() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }

    async function start() {
      setStarting(true);
      setError(null);
      stopCurrentStream();

      if (!window.isSecureContext) {
        setError('Camera requires a secure connection (HTTPS). Open the site over HTTPS or localhost and try again.');
        setStarting(false);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser does not support live camera access. Try a recent version of Chrome, Safari, or Firefox.');
        setStarting(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Some browsers reject autoplay even when muted; swallow the rejection so we don't crash.
          try { await videoRef.current.play(); } catch { /* ignore */ }
        }
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
          setError('Camera permission was denied. Enable camera access for this site in your browser settings, then try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another app or tab. Close it and try again.');
        } else {
          setError(err.message || 'Could not start the camera. Please try again.');
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      stopCurrentStream();
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [open, facing]);

  if (!open) return null;

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `snap-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
    }, 'image/jpeg', 0.92);
  }

  function flipCamera() {
    setFacing(f => (f === 'environment' ? 'user' : 'environment'));
  }

  const iconBtn = {
    width: 40, height: 40, borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
    backdropFilter: 'blur(6px)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  };

  return (
    <div
      role="dialog"
      aria-label="Camera"
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))',
        position: 'relative', zIndex: 2,
      }}>
        <button type="button" onClick={onClose} aria-label="Close camera" style={iconBtn}>
          <X size={18} />
        </button>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
          {error ? 'Camera unavailable' : 'Take a photo'}
        </span>
        <button type="button" onClick={flipCamera} aria-label="Flip camera" style={{ ...iconBtn, visibility: error ? 'hidden' : 'visible' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Preview area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {error ? (
          <div style={{ color: '#fff', textAlign: 'center', padding: '24px', maxWidth: 360 }}>
            <AlertCircle size={36} color="#fff" style={{ opacity: 0.9, marginBottom: 12 }} />
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, opacity: 0.9, marginBottom: 16 }}>{error}</p>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 22px', borderRadius: 'var(--radius-xs)',
                background: '#fff', color: 'var(--color-primary)',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {starting && <p style={{ color: '#fff', opacity: 0.8, position: 'absolute', zIndex: 10 }}>Starting camera…</p>}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                // Mirror only when using front camera so the preview matches what the user sees in a mirror.
                transform: facing === 'user' ? 'scaleX(-1)' : 'none',
                opacity: starting ? 0 : 1,
              }}
            />
          </>
        )}
      </div>

      {/* Shutter */}
      <div style={{
        padding: '20px 16px 24px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24,
        background: 'rgba(0,0,0,0.4)',
      }}>
        <button
          type="button"
          onClick={handleCapture}
          disabled={!!error || starting}
          aria-label="Capture photo"
          style={{
            width: 74, height: 74, borderRadius: '50%',
            background: '#fff',
            border: '4px solid rgba(255,255,255,0.4)',
            cursor: error || starting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: error || starting ? 0.5 : 1,
            transition: 'transform 0.1s, opacity 0.15s',
            outline: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.94)')}
          onMouseUp={e => (e.currentTarget.style.transform = '')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}
        >
          <Camera size={28} color="var(--color-primary)" />
        </button>
      </div>
    </div>
  );
}
