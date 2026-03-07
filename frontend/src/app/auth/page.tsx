'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [alias, setAlias] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const router = useRouter();
    const { login } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? '/v1/login' : '/v1/register';
            const res = await api.post(endpoint, { alias, password });

            setIsScanning(true); // Trigger retinal scan animation

            setTimeout(() => {
                login(res.data.user, res.data.access_token);
                // After scan finishes, go to Home or Planner
                router.push('/');
            }, 1500);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Connection failed.');
        }
    };

    return (
        <>
            <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")' }}>
                <div style={{ maxWidth: '450px', width: '100%', border: '4px solid var(--charcoal)', padding: '32px', position: 'relative', backgroundColor: 'var(--paper)' }}>
                    {/* Decorative corner brackets */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '16px', height: '16px', borderTop: '4px solid var(--charcoal)', borderLeft: '4px solid var(--charcoal)' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', borderBottom: '4px solid var(--charcoal)', borderRight: '4px solid var(--charcoal)' }} />

                    <header style={{ marginBottom: '32px', borderBottom: '2px dashed var(--charcoal)', paddingBottom: '16px' }}>
                        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em', color: 'var(--charcoal)', margin: 0 }}>Identity Verification</h1>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(26,26,26,0.6)', fontStyle: 'italic', marginTop: '4px' }}>Restricted access - Unauthorized entry is prohibited.</p>
                    </header>

                    {error && (
                        <div style={{ backgroundColor: 'var(--red-bright)', color: '#fff', padding: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>
                            ⚠ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--charcoal)' }}>Identifier (Alias)</label>
                            <input
                                type="text"
                                value={alias}
                                onChange={e => setAlias(e.target.value)}
                                required
                                style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '2px solid var(--charcoal)', outline: 'none', fontFamily: 'var(--font-mono)', padding: '8px 0', fontSize: '16px', transition: 'background-color 0.2s', letterSpacing: '0.1em' }}
                                placeholder="ENTER ALIAS..."
                                onFocus={e => e.currentTarget.style.backgroundColor = 'var(--paper-yellow)'}
                                onBlur={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--charcoal)' }}>Clearance Code</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '2px solid var(--charcoal)', outline: 'none', fontFamily: 'var(--font-mono)', padding: '8px 0', fontSize: '16px', transition: 'background-color 0.2s', letterSpacing: '0.1em' }}
                                placeholder="********"
                                onFocus={e => e.currentTarget.style.backgroundColor = 'var(--paper-yellow)'}
                                onBlur={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            />
                        </div>

                        <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                type="submit"
                                style={{ width: '100%', backgroundColor: 'var(--charcoal)', color: '#fff', fontFamily: 'var(--font-mono)', padding: '12px', textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--red-bright)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--charcoal)'}
                            >
                                {isLogin ? 'Establish Connection' : 'Register New Dossier'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                style={{ width: '100%', border: '2px solid var(--charcoal)', backgroundColor: 'transparent', color: 'var(--charcoal)', fontFamily: 'var(--font-mono)', padding: '12px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.1em' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--charcoal)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--charcoal)'; }}
                            >
                                {isLogin ? 'Request New Clearance?' : 'Already have access?'}
                            </button>
                        </div>
                    </form>

                    <footer style={{ marginTop: '32px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(26,26,26,0.6)', margin: 0 }}>System: Veritas v1.0.4 | Status: Ready</p>
                    </footer>
                </div>
            </div>

            {/* Retinal Scan Animation */}
            {isScanning && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    pointerEvents: 'none', zIndex: 9999, overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                        backgroundColor: 'var(--red-bright)',
                        boxShadow: '0 0 20px 4px var(--red-bright)',
                        animation: 'scan 1.5s ease-in-out forwards'
                    }} />
                    <style dangerouslySetInnerHTML={{
                        __html: `
            @keyframes scan {
              0% { top: 0; opacity: 1; }
              50% { top: 50%; height: 8px; opacity: 1; box-shadow: 0 0 40px 10px var(--red-bright); }
              100% { top: 100%; opacity: 0; }
            }
          `}} />
                </div>
            )}
        </>
    );
}
