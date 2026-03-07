'use client';

import { useInvestigationStore } from '@/store/investigationStore';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

/**
 * LogicDecoder — Cột phải: Kết nối bằng chứng + Nút kết tội.
 * Workflow: chọn Clue + Statement → Link thành cặp → Kết tội.
 */
export default function LogicDecoder({ caseId }: { caseId: string }) {
    const {
        evidencePairs,
        accusedSuspectId,
        attemptsLeft,
        isAccusing,
        clues,
        suspects,
        removePair,
        setVerdict,
        setAccusing,
    } = useInvestigationStore();

    const [showStamp, setShowStamp] = useState(false);

    useEffect(() => {
        if (evidencePairs.length > 0) {
            setShowStamp(true);
            const timer = setTimeout(() => setShowStamp(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [evidencePairs.length]);

    const accusedSuspect = suspects.find((s) => s.id === accusedSuspectId);

    const canAccuse = accusedSuspectId && evidencePairs.length > 0;

    // Submit accusation
    const handleAccuse = async () => {
        if (!canAccuse) return;
        setAccusing(true);
        try {
            const res = await api.post(`/v1/cases/${caseId}/accuse`, {
                suspect_id: accusedSuspectId,
                evidence_links: evidencePairs.map((p) => ({
                    clue_id: p.clueId,
                    statement_id: p.statementId,
                })),
            });
            setVerdict(res.data);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: unknown } };
            if (axiosErr.response?.data) {
                setVerdict(axiosErr.response.data as Parameters<typeof setVerdict>[0]);
            }
        } finally {
            setAccusing(false);
        }
    };

    return (
        <aside>
            {/* Section label */}
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#999',
                marginBottom: '10px',
                borderBottom: '1px dashed #999',
                paddingBottom: '6px',
            }}>
                ▌ LOGIC DECODER — KẾT NỐI MÂU THUẪN
            </div>

            {/* Attempts tracker */}
            <div style={{
                border: '2px solid #1a1a1a',
                padding: '10px 14px',
                marginBottom: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: attemptsLeft <= 1 ? '#fef2f2' : '#f2f0e9',
            }}>
                <span style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>ATTEMPTS:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3].map((n) => (
                        <span
                            key={n}
                            style={{
                                display: 'inline-block',
                                width: '20px',
                                height: '20px',
                                border: '2px solid #1a1a1a',
                                textAlign: 'center',
                                lineHeight: '16px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                background: n <= attemptsLeft ? '#1a1a1a' : 'transparent',
                                color: n <= attemptsLeft ? '#f2f0e9' : '#ccc',
                            }}
                        >
                            {n <= attemptsLeft ? '■' : '□'}
                        </span>
                    ))}
                </div>
            </div>



            {/* Linked pairs */}
            {evidencePairs.length > 0 && (
                <div style={{ marginBottom: '14px', position: 'relative' }}>

                    {/* The Stamp Animation */}
                    {showStamp && (
                        <div className="animate-stamp-in" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginLeft: '-90px',
                            marginTop: '-25px',
                            border: '4px solid #c41e1e',
                            color: '#c41e1e',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1rem',
                            fontWeight: 900,
                            letterSpacing: '0.1em',
                            padding: '4px 8px',
                            transform: 'rotate(-5deg)',
                            background: 'rgba(242,240,233, 0.9)',
                            zIndex: 10,
                            pointerEvents: 'none',
                        }}>
                            [ CONTRADICTION REVEALED ]
                        </div>
                    )}

                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6rem',
                        color: '#555',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                    }}>
                        CONFIRMED CONTRADICTIONS ({evidencePairs.length}):
                    </div>

                    {evidencePairs.map((pair, idx) => (
                        <div
                            key={idx}
                            style={{
                                border: '1px solid #1a1a1a',
                                padding: '8px 10px',
                                marginBottom: '6px',
                                background: '#f2f0e9',
                                position: 'relative',
                                fontSize: '0.75rem',
                            }}
                        >
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.6rem',
                                color: '#c41e1e',
                                letterSpacing: '0.08em',
                                marginBottom: '4px',
                            }}>
                                LINK #{idx + 1}
                            </div>
                            <div>
                                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                                    {pair.clueName}
                                </strong>
                                <span style={{ color: '#c41e1e', margin: '0 6px', fontWeight: 700 }}>✕</span>
                                <span style={{ fontStyle: 'italic', color: '#555' }}>
                                    &ldquo;{pair.statementContent.slice(0, 50)}…&rdquo;
                                </span>
                            </div>
                            {/* Remove */}
                            <button
                                onClick={() => removePair(idx)}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '6px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    color: '#999',
                                }}
                                title="Remove link"
                            >
                                [×]
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Accused suspect summary */}
            <div style={{
                border: '2px solid #8b1a1a',
                padding: '10px 14px',
                marginBottom: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                background: accusedSuspect ? '#fef2f2' : '#f2f0e9',
            }}>
                <div style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.12em',
                    color: '#8b1a1a',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                }}>
                    ACCUSED:
                </div>
                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    {accusedSuspect ? accusedSuspect.name : '— NONE SELECTED —'}
                </div>
            </div>

            {/* ACCUSE BUTTON */}
            <button
                onClick={handleAccuse}
                disabled={!canAccuse || isAccusing}
                style={{
                    width: '100%',
                    padding: '14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    border: canAccuse ? '3px solid #8b1a1a' : '2px solid #ccc',
                    background: canAccuse ? '#8b1a1a' : 'transparent',
                    color: canAccuse ? '#f2f0e9' : '#ccc',
                    cursor: canAccuse ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                    opacity: isAccusing ? 0.6 : 1,
                }}
            >
                {isAccusing ? 'PROCESSING . . .' : '⚖ SUBMIT ACCUSATION'}
            </button>

            {!canAccuse && (
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: '#999',
                    textAlign: 'center',
                    marginTop: '8px',
                    letterSpacing: '0.08em',
                }}>
                    REQUIRES: ACCUSED SUSPECT + MIN. 1 EVIDENCE LINK
                </div>
            )}
        </aside>
    );
}
