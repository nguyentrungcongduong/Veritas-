'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * /agency/[uuid] — "Case Acceptance" transition page.
 * Khi thám tử click "ACCEPT INVESTIGATION", họ sẽ vào đây trước.
 * Trang này hiển thị màn hình "CASE ACCEPTED" ngắn gọn rồi redirect
 * sang Evidence Board tại /cases/[uuid].
 */
export default function CaseAcceptancePage() {
    const router = useRouter();
    const params = useParams();
    const uuid = params?.uuid as string;

    const [phase, setPhase] = useState<'stamp' | 'redirect'>('stamp');
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (!uuid) return;

        // Phase 1: Show acceptance stamp for 2.5s
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setPhase('redirect');
                    // Navigate to the actual Evidence Board
                    setTimeout(() => router.replace(`/cases/${uuid}`), 300);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [uuid, router]);

    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`;

    return (
        <>
            <style>{`
        @keyframes stampDrop {
          0%   { opacity: 0; transform: scale(2.5) rotate(-20deg); }
          40%  { opacity: 1; transform: scale(0.9) rotate(-3deg); }
          55%  { transform: scale(1.05) rotate(-4deg); }
          100% { opacity: 1; transform: scale(1) rotate(-5deg); }
        }
        @keyframes flashIn {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanlines {
          0%   { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        .stamp-anim {
          animation: stampDrop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .flash-anim {
          animation: flashIn 0.4s ease 0.6s both;
        }
        .flash-anim-2 {
          animation: flashIn 0.4s ease 0.9s both;
        }
      `}</style>

            <main style={{
                minHeight: '100vh',
                backgroundColor: '#1a1a1a',
                backgroundImage: noiseTexture,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* CRT scanlines */}
                <div style={{
                    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10,
                    background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.12) 50%)',
                    backgroundSize: '100% 4px',
                    opacity: 0.5,
                }} />

                {/* Red vignette */}
                <div style={{
                    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9,
                    background: 'radial-gradient(circle, transparent 40%, rgba(139,26,26,0.3) 100%)',
                }} />

                {/* Content */}
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 20 }}>

                    {/* FILE NUMBER */}
                    <div className="flash-anim" style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        color: 'rgba(242,240,233,0.3)',
                        marginBottom: '32px',
                    }}>
                        METROPOLITAN DETECTIVE BUREAU — FILE #{uuid?.slice(0, 8).toUpperCase() ?? '--------'}
                    </div>

                    {/* STAMP */}
                    <div className="stamp-anim" style={{
                        display: 'inline-block',
                        border: '5px solid #8b1a1a',
                        padding: '14px 36px',
                        transform: 'rotate(-5deg)',
                        marginBottom: '40px',
                    }}>
                        <div style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'clamp(32px, 6vw, 56px)',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: '#8b1a1a',
                            lineHeight: 1,
                            textShadow: '0 0 20px rgba(139,26,26,0.5)',
                        }}>
                            CASE ACCEPTED
                        </div>
                    </div>

                    {/* Subtitle */}
                    <div className="flash-anim" style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        color: 'rgba(242,240,233,0.7)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '16px',
                    }}>
                        Preparing Evidence Board...
                    </div>

                    {/* Countdown + Dots */}
                    <div className="flash-anim-2" style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'rgba(242,240,233,0.35)',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                    }}>
                        Entering in {countdown}s
                        <span style={{ marginLeft: '8px' }}>
                            {Array.from({ length: 3 }, (_, i) => (
                                <span key={i} style={{ opacity: i < (3 - countdown) ? 0.6 : 0.15 }}>█ </span>
                            ))}
                        </span>
                    </div>

                    {/* Skip */}
                    <button
                        onClick={() => router.replace(`/cases/${uuid}`)}
                        style={{
                            marginTop: '40px',
                            background: 'none',
                            border: '1px solid rgba(242,240,233,0.15)',
                            color: 'rgba(242,240,233,0.3)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(242,240,233,0.4)';
                            e.currentTarget.style.color = 'rgba(242,240,233,0.7)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(242,240,233,0.15)';
                            e.currentTarget.style.color = 'rgba(242,240,233,0.3)';
                        }}
                    >
                        Skip → Enter Now
                    </button>
                </div>
            </main>
        </>
    );
}
