'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import CrimeSceneLog from '@/components/CrimeSceneLog';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface RevealStatement { id: number; content: string; type: 'truth' | 'lie'; type_label: string; }
interface RevealSuspect { id: string; name: string; bio: string; is_culprit: boolean; role_label: string; statements: RevealStatement[]; }
interface RevealClue { id: number; name: string; description: string; type: string; }
interface RevealContradiction { id: number; clue_id: number; clue_name: string; statement_id: number; statement: string; suspect_name: string; explanation: string; is_culprit_statement: boolean; }
interface RevealData {
    case_id: string; title: string; description: string;
    culprit: { id: string; name: string; bio: string } | null;
    suspects: RevealSuspect[]; clues: RevealClue[];
    contradictions: RevealContradiction[];
    outcome: { solved: boolean; exhausted: boolean; status: string };
    criminal_gloat: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSITION ANIMATION — Paper → Blueprint
// ─────────────────────────────────────────────────────────────────────────────
function TransitionOverlay({ phase }: { phase: 'paper' | 'tearing' | 'blueprint' }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }}>
            {/* Paper veil */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, #f2f0e9 0%, #e8e4d9 100%)',
                opacity: phase === 'paper' ? 1 : 0,
                transition: 'opacity 0.6s ease-out',
            }} />
            {/* Rip effect */}
            {phase === 'tearing' && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, #f2f0e9 0%, rgba(5,5,5,0.95) 50%, #050505 100%)',
                    animation: 'none',
                }} />
            )}
            {/* Scanline flash */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.03) 2px, rgba(255,0,0,0.03) 4px)',
                opacity: phase === 'blueprint' ? 1 : 0,
                transition: 'opacity 0.4s',
            }} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTCOME HEADER — Win or Lose stamp
// ─────────────────────────────────────────────────────────────────────────────
function OutcomeHeader({ outcome, gloat, caseTitle }: { outcome: RevealData['outcome']; gloat: string; caseTitle: string }) {
    const isSolved = outcome.solved;
    const color = isSolved ? '#50c850' : '#ff2020';
    const label = isSolved ? 'CASE CRACKED' : 'INVESTIGATION CLOSED';
    const icon = isSolved ? '✓' : '✗';

    return (
        <div style={{
            position: 'relative',
            borderBottom: `1px solid rgba(185,28,28,0.3)`,
            padding: '40px 48px 32px',
            background: '#070707',
        }}>
            {/* Outcome stamp */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                border: `2px solid ${color}`,
                padding: '6px 20px', marginBottom: 20,
            }}>
                <span style={{ fontSize: 18, color }}>{icon}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.35em' }}>
                    {label}
                </span>
            </div>

            {/* Case title */}
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px,3.5vw,42px)', fontWeight: 900, color: '#f2f0e9', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
                {caseTitle}
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                POST-MORTEM · THE FULL RECONSTITUTION
            </div>

            {/* Gloat quote */}
            <div style={{
                marginTop: 28,
                borderLeft: '3px solid rgba(255,32,32,0.4)',
                paddingLeft: 20,
                maxWidth: 640,
            }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,32,32,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 8 }}>
                    Message from THE MASTERMIND:
                </div>
                <blockquote style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: isSolved ? 'rgba(80,200,80,0.85)' : '#ff6060', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
                    "{gloat}"
                </blockquote>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CULPRIT REVEAL — The big moment
// ─────────────────────────────────────────────────────────────────────────────
function CulpritReveal({ culprit }: { culprit: RevealData['culprit'] }) {
    if (!culprit) return null;
    return (
        <div style={{ padding: '36px 48px', borderBottom: '1px solid rgba(185,28,28,0.15)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 16 }}>
                ⬛ THE PERPETRATOR
            </div>
            <div style={{
                display: 'inline-block',
                border: '2px solid #ff2020',
                background: 'rgba(255,32,32,0.06)',
                boxShadow: '0 0 30px rgba(255,32,32,0.2)',
                padding: '20px 32px',
                position: 'relative',
                animation: 'culprit-pulse 2s ease-in-out infinite',
            }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ff2020', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 8 }}>
                    ● THE CULPRIT
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(18px,2.5vw,30px)', fontWeight: 900, color: '#f2f0e9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {culprit.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8, fontStyle: 'italic' }}>
                    {culprit.bio}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTRADICTION GRAPH — Criminal's wiring exposed
// ─────────────────────────────────────────────────────────────────────────────
function ContradictionGraph({ contradictions, clues }: { contradictions: RevealContradiction[]; clues: RevealClue[] }) {
    if (contradictions.length === 0) return null;

    return (
        <div style={{ padding: '36px 48px', borderBottom: '1px solid rgba(185,28,28,0.15)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 8 }}>
                ⬛ THE CRIMINAL'S WIRING — CONTRADICTION GRAPH
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 24, lineHeight: 1.7 }}>
                How the Mastermind connected evidence to frame innocents and protect the culprit.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {contradictions.map((c, i) => (
                    <div key={c.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 40px 1fr 20px 1fr',
                        alignItems: 'center',
                        gap: 0,
                        background: c.is_culprit_statement ? 'rgba(255,32,32,0.04)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${c.is_culprit_statement ? 'rgba(255,32,32,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                        {/* Clue */}
                        <div style={{ padding: '14px 16px' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(180,120,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 5 }}>
                                📁 Clue
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'rgba(180,120,0,0.9)' }}>
                                {c.clue_name}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ textAlign: 'center', fontSize: 14, color: '#ff2020' }}>→</div>

                        {/* Statement */}
                        <div style={{ padding: '14px 16px', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 5 }}>
                                💬 Statement
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                "{c.statement?.slice(0, 80)}..."
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: c.is_culprit_statement ? '#ff6060' : 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                                — {c.suspect_name}
                            </div>
                        </div>

                        <div style={{ width: 1, height: '100%', background: 'rgba(255,255,255,0.05)' }} />

                        {/* Explanation */}
                        <div style={{ padding: '14px 16px' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 5 }}>
                                The truth
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,32,32,0.8)', lineHeight: 1.6 }}>
                                {c.explanation}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUSPECT DOSSIERS — All truth revealed
// ─────────────────────────────────────────────────────────────────────────────
function SuspectDossiers({ suspects }: { suspects: RevealSuspect[] }) {
    // Culprit first
    const sorted = [...suspects].sort((a, b) => (b.is_culprit ? 1 : 0) - (a.is_culprit ? 1 : 0));

    return (
        <div style={{ padding: '36px 48px', borderBottom: '1px solid rgba(185,28,28,0.15)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 24 }}>
                ⬛ FULL DOSSIERS — TRUTH REVEALED
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {sorted.map(s => (
                    <div key={s.id} style={{
                        border: `1px solid ${s.is_culprit ? 'rgba(255,32,32,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        background: s.is_culprit ? 'rgba(255,32,32,0.05)' : 'rgba(255,255,255,0.015)',
                    }}>
                        {/* Dossier header */}
                        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${s.is_culprit ? 'rgba(255,32,32,0.2)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: s.is_culprit ? 'rgba(255,32,32,0.08)' : 'transparent' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 900, color: s.is_culprit ? '#ff6060' : 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>
                                {s.is_culprit && <span style={{ marginRight: 8 }}>●</span>}
                                {s.name}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: s.is_culprit ? '#ff2020' : 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em', border: `1px solid ${s.is_culprit ? 'rgba(255,32,32,0.4)' : 'rgba(255,255,255,0.1)'}`, padding: '2px 8px' }}>
                                {s.role_label}
                            </div>
                        </div>

                        {/* Bio */}
                        <div style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {s.bio}
                        </div>

                        {/* Statements with truth revealed */}
                        {s.statements.length > 0 && (
                            <div style={{ padding: '10px 16px' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>
                                    Statements:
                                </div>
                                {s.statements.map(st => (
                                    <div key={st.id} style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: st.type === 'lie' ? '#ff4040' : '#50c850', flexShrink: 0, marginTop: 2 }}>
                                            {st.type_label}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                            "{st.content}"
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}



// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function RevealPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [data, setData] = useState<RevealData | null>(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<'paper' | 'tearing' | 'blueprint'>('paper');

    useEffect(() => {
        api.get(`/v1/cases/${id}/reveal`).then(r => {
            setData(r.data);
            setLoading(false);
            // Sequence: paper → tearing → blueprint
            setTimeout(() => setPhase('tearing'), 300);
            setTimeout(() => setPhase('blueprint'), 900);
        }).catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff2020', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                    [ DECRYPTING CASE FILES... ]
                </div>
            </div>
        );
    }
    if (!data) return null;

    return (
        <>
            <TransitionOverlay phase={phase} />

            <div className="blueprint-cursor" style={{
                minHeight: '100vh',
                background: '#050505',
                color: '#f2f2f2',
                opacity: phase === 'blueprint' ? 1 : 0,
                transition: 'opacity 0.5s ease-in',
                position: 'relative',
            }}>
                {/* Blueprint grid background */}
                <div style={{ position: 'fixed', inset: 0, backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, rgba(185,28,28,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(185,28,28,0.04) 1px, transparent 1px)', pointerEvents: 'none', zIndex: 0 }} />

                {/* Nav bar */}
                <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,5,5,0.96)', borderBottom: '1px solid rgba(185,28,28,0.2)', backdropFilter: 'blur(8px)', padding: '0 48px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 6, height: 6, background: '#ff2020' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ff2020', textTransform: 'uppercase', letterSpacing: '0.35em', fontWeight: 'bold' }}>
                            POST-MORTEM
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <button onClick={() => router.push(`/cases/${id}`)} style={{ background: 'none', border: '1px solid rgba(185,28,28,0.3)', color: 'rgba(255,32,32,0.6)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '5px 16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            ← BACK TO CASE
                        </button>
                        <button onClick={() => router.push('/agency')} style={{ background: '#ff2020', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 'bold', padding: '5px 16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            THE AGENCY →
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
                    <OutcomeHeader outcome={data.outcome} gloat={data.criminal_gloat} caseTitle={data.title} />
                    <CulpritReveal culprit={data.culprit} />
                    <ContradictionGraph contradictions={data.contradictions} clues={data.clues} />
                    <SuspectDossiers suspects={data.suspects} />
                    <CrimeSceneLog caseId={id} />
                </div>
            </div>
        </>
    );
}
