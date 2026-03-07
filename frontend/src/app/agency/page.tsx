'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { useAuthStore } from '@/store/useAuthStore';

// ─── Types ───────────────────────────────────────────────
interface CaseData {
    id: string;
    title: string;
    description: string;
    difficulty: number;
    reward_fame: number;
    investigations_count: number;
    created_at: string;
    author: { id: string; username: string };
}

interface CaseFeed {
    data: CaseData[];
    meta: { current_page: number; last_page: number; total: number };
}

// ─── Utility: Play metal drawer SFX via Web Audio API ────
function playMetalDrawerSFX() {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // Layer 1: Low metallic thud
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        const oscillator = ctx.createOscillator();
        oscillator.connect(gainNode);
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(180, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.8);

        // Layer 2: High metallic scrape
        const gainNode2 = ctx.createGain();
        gainNode2.connect(ctx.destination);
        gainNode2.gain.setValueAtTime(0.3, ctx.currentTime + 0.05);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
        filter.Q.value = 0.8;

        noise.connect(filter);
        filter.connect(gainNode2);
        noise.start(ctx.currentTime + 0.05);

        // Layer 3: Final click/lock
        const gainNode3 = ctx.createGain();
        gainNode3.connect(ctx.destination);
        gainNode3.gain.setValueAtTime(0.8, ctx.currentTime + 0.55);
        gainNode3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

        const click = ctx.createOscillator();
        click.connect(gainNode3);
        click.type = 'square';
        click.frequency.setValueAtTime(80, ctx.currentTime + 0.55);
        click.start(ctx.currentTime + 0.55);
        click.stop(ctx.currentTime + 0.7);

    } catch (e) {
        // Silently fail — SFX is enhancement, not critical
    }
}

// ─── Difficulty Stars ─────────────────────────────────────
function DifficultyStars({ level }: { level: number }) {
    return (
        <span style={{ letterSpacing: '2px', fontSize: '11px' }}>
            {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < level ? '#8b1a1a' : 'rgba(26,26,26,0.2)' }}>★</span>
            ))}
        </span>
    );
}

// ─── CaseFolder Component ─────────────────────────────────
function CaseFolder({ caseData, index }: { caseData: CaseData; index: number }) {
    const [hovered, setHovered] = useState(false);
    const dateStr = new Date(caseData.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: '2-digit'
    });

    // Slight random tilt per folder for realism
    const tilt = ((index % 3) - 1) * 0.4;

    return (
        <div
            style={{
                position: 'relative',
                transform: hovered ? `translateY(-10px) rotate(${tilt}deg)` : `translateY(0px) rotate(${tilt}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
                marginTop: '28px',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Tab Label */}
            <div style={{
                position: 'absolute',
                top: '-26px',
                left: '0',
                backgroundColor: hovered ? '#1a1a1a' : '#ddd8c8',
                color: hovered ? '#f2f0e9' : '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderBottom: 'none',
                padding: '4px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                transition: 'background-color 0.2s, color 0.2s',
                whiteSpace: 'nowrap',
            }}>
                FILE #{caseData.id.slice(0, 8).toUpperCase()}
            </div>

            {/* Folder Body */}
            <div style={{
                backgroundColor: hovered ? '#e8e2d0' : '#ede9dd',
                border: '2px solid #1a1a1a',
                padding: '20px',
                boxShadow: hovered
                    ? '6px 6px 0px 0px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.5)'
                    : '3px 3px 0px 0px rgba(0,0,0,0.7)',
                transition: 'box-shadow 0.25s ease, background-color 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Paper grain overlay */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
                }} />

                {/* Top Bar: Priority + Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{
                        backgroundColor: caseData.difficulty >= 4 ? '#8b1a1a' : caseData.difficulty >= 3 ? '#6b4400' : '#2d4a1a',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '3px 8px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        {caseData.difficulty >= 4 ? '🔴 CRITICAL' : caseData.difficulty >= 3 ? '🟡 PRIORITY' : '🟢 STANDARD'}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(26,26,26,0.5)', textTransform: 'uppercase' }}>
                        FILED: {dateStr}
                    </span>
                </div>

                {/* Title */}
                <h3 style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '18px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    marginBottom: '6px',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                }}>
                    {caseData.title}
                </h3>

                {/* Difficulty row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <DifficultyStars level={caseData.difficulty} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(26,26,26,0.5)', textTransform: 'uppercase' }}>
                        DIFFICULTY {caseData.difficulty}/5
                    </span>
                </div>

                {/* Description */}
                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: 'rgba(26,26,26,0.75)',
                    lineHeight: 1.55,
                    marginBottom: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    "{caseData.description}"
                </p>

                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(26,26,26,0.15)', marginBottom: '12px' }} />

                {/* Footer Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(26,26,26,0.6)' }}>
                        Mastermind: <span style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{caseData.author?.username ?? 'Unknown'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase' }}>
                        <span style={{ color: '#2d4a1a', fontWeight: 'bold' }}>+{caseData.reward_fame} Fame</span>
                        <span style={{ color: 'rgba(26,26,26,0.45)' }}>{caseData.investigations_count} agents</span>
                    </div>
                </div>

                {/* CTA — Slides in on hover */}
                <div style={{
                    maxHeight: hovered ? '48px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    <Link
                        href={`/cases/${caseData.id}`}
                        style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'center',
                            backgroundColor: '#1a1a1a',
                            color: '#f2f0e9',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            padding: '10px',
                            textDecoration: 'none',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#8b1a1a')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
                    >
                        ⟶ ACCEPT INVESTIGATION
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton Loader Card ─────────────────────────────────
function SkeletonFolder() {
    return (
        <div style={{ marginTop: '28px', position: 'relative' }}>
            <div style={{
                position: 'absolute', top: '-26px', left: 0,
                width: '120px', height: '24px',
                backgroundColor: '#e0dbd0',
                border: '2px solid rgba(26,26,26,0.15)',
                borderBottom: 'none',
                animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
                backgroundColor: '#ede9dd',
                border: '2px solid rgba(26,26,26,0.15)',
                padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
                <div style={{ height: '12px', width: '60%', backgroundColor: '#ddd8c8', borderRadius: '2px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: '20px', width: '85%', backgroundColor: '#ddd8c8', borderRadius: '2px', animation: 'pulse 1.5s ease-in-out infinite 0.1s' }} />
                <div style={{ height: '12px', width: '40%', backgroundColor: '#ddd8c8', borderRadius: '2px', animation: 'pulse 1.5s ease-in-out infinite 0.2s' }} />
                <div style={{ height: '32px', width: '100%', backgroundColor: '#ddd8c8', borderRadius: '2px', animation: 'pulse 1.5s ease-in-out infinite 0.3s' }} />
            </div>
        </div>
    );
}

// ─── Main Page Component ──────────────────────────────────
export default function AgencyPage() {
    const { setRole } = useUserStore();
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filterDifficulty, setFilterDifficulty] = useState<number | null>(null);

    // Set role and play SFX on mount
    useEffect(() => {
        checkAuth();
        if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('veritas_token')) {
            router.push('/auth');
            return;
        }

        setRole('DETECTIVE');
        const t = setTimeout(() => {
            playMetalDrawerSFX();
            setDrawerOpen(true);
        }, 200);
        return () => clearTimeout(t);
    }, [setRole, isAuthenticated, router, checkAuth]);

    const { data, isLoading, isError } = useQuery<CaseFeed>({
        queryKey: ['agency', 'cases'],
        queryFn: () => api.get('/v1/cases').then(res => res.data),
        staleTime: 30_000,
    });

    const filteredCases = data?.data.filter(c =>
        filterDifficulty === null ? true : c.difficulty === filterDifficulty
    ) ?? [];

    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

    return (
        <>
            {/* CSS Keyframes for skeleton pulse */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes drawerSlide {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes stampReveal {
          0% { opacity: 0; transform: scale(1.4) rotate(-15deg); }
          60% { opacity: 1; transform: scale(0.9) rotate(-3deg); }
          100% { opacity: 1; transform: scale(1) rotate(-5deg); }
        }
        .agency-drawer-open {
          animation: drawerSlide 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

            <main style={{
                minHeight: '100vh',
                backgroundColor: 'var(--paper)',
                color: 'var(--charcoal)',
                backgroundImage: noiseTexture,
                padding: '24px',
            }}>
                <div style={{
                    maxWidth: '1280px',
                    width: '100%',
                    margin: '0 auto',
                    border: '3px solid var(--charcoal)',
                    backgroundColor: 'var(--paper)',
                    minHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}>

                    {/* ── Header ──────────────────────────────── */}
                    <header style={{
                        padding: '28px 36px',
                        borderBottom: '3px solid var(--charcoal)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        position: 'relative',
                    }}>
                        {/* Vignette mark top-left */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#8b1a1a' }} />

                        <div style={{ paddingLeft: '16px' }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3em',
                                color: '#8b1a1a',
                                marginBottom: '8px',
                            }}>
                                ████  CLASSIFIED ACCESS — CLEARANCE: OMEGA
                            </div>
                            <h1 style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 'clamp(36px, 5vw, 60px)',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '-0.04em',
                                lineHeight: 1,
                                marginBottom: '10px',
                            }}>
                                THE AGENCY
                            </h1>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '11px',
                                color: 'rgba(26,26,26,0.5)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                            }}>
                                ACTIVE INVESTIGATIONS ARCHIVE — METROPOLITAN DETECTIVE BUREAU
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <button
                                onClick={() => router.push('/')}
                                style={{
                                    backgroundColor: 'var(--charcoal)', color: 'var(--paper)',
                                    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold',
                                    textTransform: 'uppercase', letterSpacing: '0.1em',
                                    padding: '10px 20px', cursor: 'pointer', border: 'none',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                            >
                                ← BACK TO BULLETIN
                            </button>
                            {/* Total Count Stamp */}
                            {data && (
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'rgba(26,26,26,0.5)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}>
                                    {data.meta?.total ?? data.data.length} ACTIVE CASE{(data.meta?.total ?? data.data.length) !== 1 ? 'S' : ''} IN ARCHIVE
                                </div>
                            )}
                        </div>
                    </header>

                    {/* ── Toolbar / Filters ────────────────────────────── */}
                    <div style={{
                        padding: '16px 36px',
                        borderBottom: '1px solid rgba(26,26,26,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,26,26,0.5)' }}>
                            Filter by Difficulty:
                        </span>
                        {[null, 1, 2, 3, 4, 5].map(d => (
                            <button
                                key={d ?? 'all'}
                                onClick={() => setFilterDifficulty(d)}
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    padding: '5px 12px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--charcoal)',
                                    backgroundColor: filterDifficulty === d ? '#1a1a1a' : 'transparent',
                                    color: filterDifficulty === d ? '#f2f0e9' : '#1a1a1a',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {d === null ? 'ALL' : `★`.repeat(d)}
                            </button>
                        ))}
                    </div>

                    {/* ── Filing Cabinet — Case Grid ───────────── */}
                    <div
                        className={drawerOpen ? 'agency-drawer-open' : ''}
                        style={{
                            flex: 1,
                            padding: '16px 36px 48px 36px',
                            opacity: drawerOpen ? 1 : 0,
                        }}
                    >
                        {/* Loading Skeletons */}
                        {isLoading && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '24px',
                                paddingTop: '8px',
                            }}>
                                {Array.from({ length: 6 }).map((_, i) => <SkeletonFolder key={i} />)}
                            </div>
                        )}

                        {/* Error State */}
                        {isError && (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                height: '300px', gap: '16px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                            }}>
                                <div style={{ fontSize: '48px' }}>⚠</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8b1a1a' }}>ARCHIVE UNAVAILABLE</div>
                                <div style={{ fontSize: '11px', color: 'rgba(26,26,26,0.5)' }}>Could not reach the archives. Check backend connection.</div>
                                <button
                                    onClick={() => window.location.reload()}
                                    style={{
                                        backgroundColor: '#1a1a1a', color: '#f2f0e9',
                                        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold',
                                        padding: '10px 20px', border: 'none', cursor: 'pointer',
                                        textTransform: 'uppercase', letterSpacing: '0.1em',
                                    }}
                                >
                                    RETRY CONNECTION
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !isError && filteredCases.length === 0 && (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                height: '300px', gap: '16px',
                            }}>
                                <div style={{
                                    border: '2px solid rgba(26,26,26,0.2)',
                                    padding: '32px 48px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📂</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: 'italic', color: 'rgba(26,26,26,0.5)' }}>
                                        {filterDifficulty ? `No ${filterDifficulty}-star cases in archive.` : 'The Archive is Empty. No Open Cases.'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Case Grid */}
                        {!isLoading && !isError && filteredCases.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '24px',
                                paddingTop: '8px',
                            }}>
                                {filteredCases.map((c, i) => (
                                    <CaseFolder key={c.id} caseData={c} index={i} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Footer Stamp ──────────────────────────────── */}
                    <footer style={{
                        padding: '16px 36px',
                        borderTop: '3px solid var(--charcoal)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: 'rgba(26,26,26,0.3)',
                    }}>
                        <span>METROPOLITAN DETECTIVE BUREAU — ALL FILES CLASSIFIED</span>
                        <span>FOR AUTHORIZED PERSONNEL ONLY</span>
                        <div style={{
                            border: '2px solid rgba(26,26,26,0.15)',
                            padding: '4px 12px',
                            fontWeight: 'bold',
                            color: 'rgba(139,26,26, 0.4)',
                            letterSpacing: '0.3em',
                            fontSize: '10px',
                        }}>
                            RESTRICTED
                        </div>
                    </footer>

                </div>
            </main>
        </>
    );
}
