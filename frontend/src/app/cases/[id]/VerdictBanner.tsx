'use client';

import { useInvestigationStore } from '@/store/investigationStore';
import { useParams, useRouter } from 'next/navigation';

/**
 * VerdictBanner — Hiển thị kết quả phán xét.
 * CASE SOLVED: red stamp style.
 * WRONG: yellow warning dashed border.
 */
export default function VerdictBanner() {
    const { verdict } = useInvestigationStore();
    const params = useParams();
    const router = useRouter();
    const caseId = params?.id as string;

    if (!verdict) return null;

    const isSolved = verdict.verdict === 'CASE_SOLVED';
    const isGameOver = verdict.verdict === 'OUT_OF_ATTEMPTS';
    const showReveal = isSolved || isGameOver;

    return (
        <div style={{
            marginTop: '20px',
            border: isSolved
                ? '3px solid #8b1a1a'
                : isGameOver
                    ? '3px solid #1a1a1a'
                    : '2px dashed #b8860b',
            padding: '0',
            position: 'relative',
            background: isSolved
                ? '#fef2f2'
                : isGameOver
                    ? '#f5f5f5'
                    : '#fffbeb',
        }}>
            {/* Stamp header */}
            <div style={{
                background: isSolved ? '#8b1a1a' : isGameOver ? '#1a1a1a' : '#b8860b',
                color: '#f2f0e9',
                padding: '8px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
            }}>
                {isSolved
                    ? '■ CASE SOLVED — CONDEMNED'
                    : isGameOver
                        ? '■ CASE FAILED — INVESTIGATION CLOSED'
                        : '■ WRONG ACCUSATION'}
            </div>

            <div style={{ padding: '16px 20px' }}>
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    lineHeight: 1.7,
                    color: '#2d2d2d',
                }}>
                    {verdict.message}
                </p>

                {/* Fame earned */}
                {verdict.fame_earned && (
                    <div style={{
                        marginTop: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: '#2d4a1a',
                        letterSpacing: '0.1em',
                    }}>
                        FAME EARNED: +{verdict.fame_earned}
                    </div>
                )}

                {/* Hint */}
                {verdict.hint && (
                    <div style={{
                        marginTop: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: '#b8860b',
                        letterSpacing: '0.05em',
                    }}>
                        {verdict.hint}
                    </div>
                )}

                {/* Contradiction explanations on solve */}
                {isSolved && verdict.details?.valid_pairs && (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6rem',
                            color: '#555',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                            borderBottom: '1px dashed #ccc',
                            paddingBottom: '4px',
                        }}>
                            VERIFIED CONTRADICTIONS:
                        </div>

                        {verdict.details.valid_pairs.map((pair: any, i: number) => (
                            <div key={i} style={{
                                border: '1px solid #1a1a1a',
                                padding: '10px 12px',
                                marginBottom: '6px',
                                background: '#f2f0e9',
                                fontSize: '0.8rem',
                                lineHeight: 1.5,
                            }}>
                                <div>
                                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#2d4a1a' }}>
                                        {pair.clue}
                                    </strong>
                                    <span style={{ color: '#c41e1e', margin: '0 8px', fontWeight: 700 }}>✕</span>
                                    <span style={{ fontStyle: 'italic' }}>&ldquo;{pair.statement}&rdquo;</span>
                                </div>
                                <div style={{
                                    marginTop: '6px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    color: '#8b1a1a',
                                    borderTop: '1px dashed #ccc',
                                    paddingTop: '6px',
                                }}>
                                    → {pair.explanation}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Score */}
                {verdict.details?.score && (
                    <div style={{
                        marginTop: '12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#1a1a1a',
                        letterSpacing: '0.1em',
                        borderTop: '2px solid #1a1a1a',
                        paddingTop: '10px',
                    }}>
                        DEDUCTION SCORE: {verdict.details.score}
                    </div>
                )}

                {/* THE BIG REVEAL BUTTON */}
                {showReveal && (
                    <button
                        onClick={() => router.push(`/cases/${caseId}/postmortem`)}
                        style={{
                            marginTop: '16px',
                            width: '100%',
                            background: isSolved ? '#8b1a1a' : '#1a1a1a',
                            color: '#f2f0e9',
                            border: 'none',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.25em',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isSolved ? '#c41e1e' : '#333'}
                        onMouseLeave={e => e.currentTarget.style.background = isSolved ? '#8b1a1a' : '#1a1a1a'}
                    >
                        <span>⬛</span>
                        SEE THE FULL TRUTH — CRIMINAL'S BLUEPRINT
                        <span>→</span>
                    </button>
                )}
            </div>
        </div>
    );
}


