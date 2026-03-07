'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import api from '@/lib/api';

import { useAuthStore } from '@/store/useAuthStore';

// ─── Types ───────────────────────────────────────────────
interface CreateFormData {
    title: string;
    description: string;
    difficulty: number;
    reward_fame: number;
}

// ─── Animated Number Ticker ───────────────────────────────
function StatTicker({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 'bold',
                color: '#c41e1e', letterSpacing: '0.15em',
                textShadow: '0 0 12px rgba(196,30,30,0.6)',
            }}>
                {value}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                {label}
            </div>
        </div>
    );
}

// ─── Difficulty Selector ─────────────────────────────────
function DifficultySelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const labels = ['', 'EASY', 'MEDIUM', 'HARD', 'EXPERT', 'IMPOSSIBLE'];
    const colors = ['', '#2d4a1a', '#6b4400', '#8b1a1a', '#6b0000', '#3d0000'];
    return (
        <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(d => (
                <button
                    key={d}
                    onClick={() => onChange(d)}
                    style={{
                        flex: 1, padding: '8px 4px', cursor: 'pointer', border: 'none',
                        backgroundColor: value === d ? colors[d] : 'rgba(255,255,255,0.04)',
                        color: value === d ? '#fff' : 'rgba(255,255,255,0.2)',
                        fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 'bold',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        outline: value === d ? `1px solid ${colors[d]}` : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.15s ease',
                    }}
                >
                    {'★'.repeat(d)}<br />
                    <span style={{ fontSize: '7px', opacity: 0.7 }}>{labels[d]}</span>
                </button>
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────
export default function PlannerPage() {
    const { setRole } = useUserStore();
    const router = useRouter();
    const { isAuthenticated, user, checkAuth } = useAuthStore();
    const [showForm, setShowForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [glitch, setGlitch] = useState(false);

    const [form, setForm] = useState<CreateFormData>({
        title: '',
        description: '',
        difficulty: 3,
        reward_fame: 300,
    });

    useEffect(() => {
        checkAuth();
        if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('veritas_token')) {
            router.push('/auth');
            return;
        }

        setRole('CRIMINAL');
        // Glitch flicker on mount
        const t = setTimeout(() => setGlitch(true), 100);
        const t2 = setTimeout(() => setGlitch(false), 600);
        return () => { clearTimeout(t); clearTimeout(t2); };
    }, [setRole, isAuthenticated, router, checkAuth]);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            setError('Title and description are required.');
            return;
        }
        setIsCreating(true);
        setError(null);
        try {
            const res = await api.post('/v1/planner', {
                ...form,
                reward_fame: form.difficulty * 100,
            });
            router.push(`/planner/${res.data.id}`);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Failed to create case. Is the backend running?');
            setIsCreating(false);
        }
    };

    const gridBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(196,30,30,0.07)' stroke-width='1'/%3E%3C/svg%3E")`;

    return (
        <>
            <style>{`
        @keyframes glitchH {
          0%,100% { clip-path: inset(0 0 100% 0); transform: translateX(0); }
          20%      { clip-path: inset(30% 0 50% 0); transform: translateX(-4px); }
          40%      { clip-path: inset(70% 0 10% 0); transform: translateX(4px); }
          60%      { clip-path: inset(0 0 80% 0);   transform: translateX(-2px); }
          80%      { clip-path: inset(50% 0 30% 0); transform: translateX(2px); }
        }
        @keyframes redPulse {
          0%,100% { box-shadow: 0 0 8px rgba(196,30,30,0.3), inset 0 0 8px rgba(196,30,30,0.05); }
          50%      { box-shadow: 0 0 20px rgba(196,30,30,0.6), inset 0 0 16px rgba(196,30,30,0.1); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .form-fadeup { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .input-dark {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(196,30,30,0.25);
          color: #f2f0e9;
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 10px 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-dark:focus {
          border-color: #c41e1e;
          box-shadow: 0 0 0 2px rgba(196,30,30,0.15);
        }
        .input-dark::placeholder { color: rgba(255,255,255,0.2); }
        .btn-create {
          background: #c41e1e;
          color: #fff;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 14px 32px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
        }
        .btn-create:hover:not(:disabled) {
          background: #a01515;
          box-shadow: 0 0 20px rgba(196,30,30,0.5);
        }
        .btn-create:active:not(:disabled) { transform: scale(0.98); }
        .btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

            <main style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                backgroundImage: gridBg,
                color: '#f2f0e9',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Scanline sweep */}
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(transparent, rgba(196,30,30,0.4), transparent)',
                    animation: 'scanline 4s linear infinite',
                    pointerEvents: 'none', zIndex: 100,
                }} />
                {/* Vignette */}
                <div style={{
                    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)',
                }} />

                <div style={{
                    maxWidth: '1280px', width: '100%', margin: '0 auto',
                    border: '1px solid rgba(196,30,30,0.3)',
                    backgroundColor: '#0d0d0d',
                    minHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 2,
                    animation: 'redPulse 3s ease-in-out infinite',
                }}>

                    {/* ── Header ───────────────────────────────── */}
                    <header style={{
                        padding: '28px 36px',
                        borderBottom: '1px solid rgba(196,30,30,0.25)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0,
                            width: '3px', height: '100%',
                            background: 'linear-gradient(to bottom, #c41e1e, transparent)',
                        }} />
                        <div style={{ paddingLeft: '16px' }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 'bold',
                                textTransform: 'uppercase', letterSpacing: '0.4em',
                                color: 'rgba(196,30,30,0.6)', marginBottom: '10px',
                            }}>
                                ▓▓▓  SECURE CHANNEL · ENCRYPTION: ACTIVE · IDENTITY: [REDACTED]
                            </div>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <h1 style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 'clamp(36px, 5vw, 64px)',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.04em',
                                    lineHeight: 1,
                                    color: '#f2f0e9',
                                    marginBottom: '10px',
                                }}>
                                    THE BLUEPRINT ROOM
                                </h1>
                                {/* Glitch layer */}
                                {glitch && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0,
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 'clamp(36px, 5vw, 64px)',
                                        fontWeight: 900, textTransform: 'uppercase',
                                        letterSpacing: '-0.04em', lineHeight: 1,
                                        color: '#c41e1e', animation: 'glitchH 0.4s steps(1) forwards',
                                        pointerEvents: 'none',
                                    }}>
                                        THE BLUEPRINT ROOM
                                    </div>
                                )}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: '11px',
                                color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em',
                            }}>
                                CRIMINAL OPERATIONS CENTER — CASE DESIGN WORKSPACE
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <button
                                onClick={() => setShowForm(true)}
                                style={{
                                    background: '#c41e1e',
                                    color: '#fff',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px', fontWeight: 'bold',
                                    textTransform: 'uppercase', letterSpacing: '0.1em',
                                    padding: '10px 20px', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 0 16px rgba(196,30,30,0.4)',
                                    transition: 'box-shadow 0.2s',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(196,30,30,0.8)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(196,30,30,0.4)'}
                            >
                                + NEW OPERATION
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                style={{
                                    background: 'none', color: 'rgba(255,255,255,0.3)',
                                    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold',
                                    textTransform: 'uppercase', letterSpacing: '0.1em',
                                    padding: '10px 20px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                ← DISCONNECT
                            </button>
                        </div>
                    </header>

                    {/* ── Stats Bar ───────────────────────────────── */}
                    <div style={{
                        padding: '16px 36px',
                        borderBottom: '1px solid rgba(196,30,30,0.1)',
                        display: 'flex', gap: '48px', alignItems: 'center',
                        background: 'rgba(196,30,30,0.03)',
                    }}>
                        <StatTicker label="Active Operations" value="0" />
                        <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.06)' }} />
                        <StatTicker label="Detectives Fooled" value="—" />
                        <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.06)' }} />
                        <StatTicker label="Infamy Earned" value="—" />
                        <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.06)' }} />
                        <StatTicker label="Avg Trap Rate" value="—" />
                    </div>

                    {/* ── Body ─────────────────────────────────── */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 36px' }}>
                        {!showForm ? (
                            // Empty State CTA
                            <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                                <div style={{
                                    width: '80px', height: '80px', margin: '0 auto 24px',
                                    border: '2px solid rgba(196,30,30,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '36px',
                                    background: 'rgba(196,30,30,0.05)',
                                }}>
                                    💀
                                </div>
                                <div style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '12px',
                                    color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
                                    letterSpacing: '0.3em', marginBottom: '16px',
                                }}>
                                    [ NO ACTIVE OPERATIONS ]
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-body)', fontSize: '26px', fontWeight: 900,
                                    textTransform: 'uppercase', color: '#f2f0e9', marginBottom: '12px',
                                    letterSpacing: '-0.02em',
                                }}>
                                    Design the Perfect Crime
                                </h2>
                                <p style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '12px',
                                    color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, marginBottom: '32px',
                                }}>
                                    Build an airtight alibi. Plant misleading evidence. Watch a hundred detectives fail.
                                    If anyone cracks your case — you lose Infamy. Make it <em style={{ color: 'rgba(196,30,30,0.8)' }}>unsolvable</em>.
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    style={{
                                        background: '#c41e1e', color: '#fff',
                                        fontFamily: 'var(--font-mono)', fontSize: '12px',
                                        fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em',
                                        padding: '14px 40px', border: 'none', cursor: 'pointer',
                                        boxShadow: '0 0 24px rgba(196,30,30,0.5)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(196,30,30,0.8)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(196,30,30,0.5)'}
                                >
                                    ⚡ INITIATE OPERATION
                                </button>
                            </div>
                        ) : (
                            // Create Form
                            <div className="form-fadeup" style={{
                                width: '100%', maxWidth: '560px',
                                border: '1px solid rgba(196,30,30,0.3)',
                                background: '#111',
                                padding: '40px',
                            }}>
                                <div style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 'bold',
                                    textTransform: 'uppercase', letterSpacing: '0.4em',
                                    color: '#c41e1e', marginBottom: '24px',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    <span style={{
                                        display: 'inline-block', width: '8px', height: '8px',
                                        background: '#c41e1e', borderRadius: '50%',
                                        animation: 'redPulse 1s ease-in-out infinite',
                                    }} />
                                    NEW OPERATION — BRIEF SETUP
                                </div>

                                <h2 style={{
                                    fontFamily: 'var(--font-body)', fontSize: '26px', fontWeight: 900,
                                    textTransform: 'uppercase', color: '#f2f0e9', marginBottom: '28px',
                                    letterSpacing: '-0.02em', lineHeight: 1.1,
                                }}>
                                    Name Your Crime
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {/* Title */}
                                    <div>
                                        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>
                                            Operation Codename *
                                        </label>
                                        <input
                                            className="input-dark"
                                            placeholder="e.g. The Vanishing Surgeon"
                                            value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            maxLength={120}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>
                                            Crime Summary *
                                        </label>
                                        <textarea
                                            className="input-dark"
                                            placeholder="Describe the crime scene, not the solution. Make it intriguing."
                                            value={form.description}
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            rows={4}
                                            style={{ resize: 'vertical', minHeight: '80px' }}
                                        />
                                    </div>

                                    {/* Difficulty */}
                                    <div>
                                        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '8px' }}>
                                            Difficulty Level (affects Infamy reward)
                                        </label>
                                        <DifficultySelector value={form.difficulty} onChange={d => setForm(f => ({ ...f, difficulty: d, reward_fame: d * 100 }))} />
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>
                                            Reward: <span style={{ color: '#c41e1e' }}>+{form.difficulty * 100} Infamy</span> if detectives fail • Penalty if cracked
                                        </div>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div style={{
                                            fontFamily: 'var(--font-mono)', fontSize: '11px',
                                            color: '#c41e1e', padding: '8px 12px',
                                            border: '1px solid rgba(196,30,30,0.3)',
                                            background: 'rgba(196,30,30,0.05)',
                                        }}>
                                            ⚠ {error}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <button
                                            onClick={handleCreate}
                                            disabled={isCreating}
                                            className="btn-create"
                                            style={{ flex: 2 }}
                                        >
                                            {isCreating ? '[ ENCRYPTING... ]' : '⟶ OPEN BLUEPRINT ROOM'}
                                        </button>
                                        <button
                                            onClick={() => { setShowForm(false); setError(null); }}
                                            style={{
                                                flex: 1, background: 'none', color: 'rgba(255,255,255,0.3)',
                                                fontFamily: 'var(--font-mono)', fontSize: '11px',
                                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                        >
                                            ABORT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ──────────────────────────────── */}
                    <footer style={{
                        padding: '14px 36px',
                        borderTop: '1px solid rgba(196,30,30,0.1)',
                        display: 'flex', justifyContent: 'space-between',
                        fontFamily: 'var(--font-mono)', fontSize: '9px',
                        color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.2em',
                    }}>
                        <span>CRIMINAL OPERATIONS CENTER — ALL ACTIVITY MONITORED</span>
                        <span style={{ color: 'rgba(196,30,30,0.3)' }}>■ LIVE</span>
                    </footer>
                </div>
            </main>
        </>
    );
}
