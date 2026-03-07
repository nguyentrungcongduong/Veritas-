'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function IdentityGate() {
    const { isAuthenticated, user, checkAuth, logout } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        checkAuth();
        setMounted(true);
    }, [checkAuth]);

    if (!mounted) return null;

    return (
        <div style={{ position: 'fixed', top: '16px', right: '24px', zIndex: 100, display: 'flex', gap: '16px', alignItems: 'center' }}>
            {isAuthenticated && user ? (
                <>
                    <div
                        onClick={() => router.push('/profile')}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            color: user.prestige > user.fame ? 'var(--red-bright)' : 'var(--blue-logic)',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            textShadow: '0 0 5px currentColor',
                            cursor: 'pointer'
                        }}
                        title="View Dossier Profile"
                    >
                        [ AGENT: {user.alias} ]
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/'); }}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--charcoal)',
                            color: 'var(--charcoal)',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--charcoal)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        DISCONNECT
                    </button>
                </>
            ) : (
                <button
                    onClick={() => router.push('/auth')}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--charcoal)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        animation: 'blink 2s infinite'
                    }}
                >
                    [ ACCESS: UNAUTHORIZED ]
                </button>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}} />
        </div>
    );
}
