'use client';

import { useInvestigationStore } from '@/store/investigationStore';
import { useEffect, useState } from 'react';

/**
 * CaseReportOverlay — The Final Report.
 * Xuất hiện sau khi phá án thành công.
 */
export default function CaseReportOverlay() {
    const { verdict, caseTitle } = useInvestigationStore();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (verdict?.verdict === 'CASE_SOLVED') {
            const timer = setTimeout(() => setShow(true), 500); // delay nửa tỷ
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [verdict]);

    if (!show || verdict?.verdict !== 'CASE_SOLVED') return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(26,26,26,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
        }}>
            <div className="animate-stamp-in" style={{
                background: '#f2f0e9',
                border: '3px solid #1a1a1a',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                width: '100%',
                maxWidth: '650px',
                padding: '40px',
                position: 'relative',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.06\'/%3E%3C/svg%3E")',
            }}>
                {/* Stamp */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '30px',
                    border: '4px solid #c41e1e',
                    color: '#c41e1e',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    padding: '8px 16px',
                    transform: 'rotate(12deg)',
                    opacity: 0.8,
                    pointerEvents: 'none',
                }}>
                    CASE CLOSER
                </div>

                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#555',
                    borderBottom: '2px solid #1a1a1a',
                    paddingBottom: '12px',
                    marginBottom: '24px',
                    letterSpacing: '0.1em',
                }}>
                    FINAL INVESTIGATION REPORT
                </div>

                <h2 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    color: '#1a1a1a',
                }}>
                    {caseTitle}
                </h2>

                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    color: '#c41e1e',
                    marginBottom: '24px',
                }}>
                    ▶ CULPRIT: {verdict.details?.culprit}
                </div>

                <div style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#1a1a1a',
                    marginBottom: '30px',
                    border: '1px dashed #888',
                    padding: '16px',
                    background: '#faf8f2',
                }}>
                    {verdict.message.split('. ').map((s, i) => (
                        <p key={i} style={{ marginBottom: '10px' }}>{s}.</p>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    borderTop: '1px solid #ccc',
                    paddingTop: '16px',
                }}>
                    <div>
                        <span style={{ color: '#555' }}>SCORE: </span>
                        <strong>{verdict.details?.score} PTS</strong>
                    </div>
                    <div>
                        <span style={{ color: '#555' }}>FAME: </span>
                        <strong>+{verdict.fame_earned}</strong>
                    </div>
                </div>

                {/* Share Button Placeholder */}
                <button
                    onClick={() => {
                        window.alert('Cope link to clipboard! (Demo)');
                    }}
                    style={{
                        marginTop: '30px',
                        width: '100%',
                        padding: '12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        border: '2px solid #1a1a1a',
                        background: '#1a1a1a',
                        color: '#f2f0e9',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                >
                    ⎘ COPY SHAREABLE CERTIFICATE
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        marginTop: '10px',
                        width: '100%',
                        padding: '12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        border: '1px solid #1a1a1a',
                        background: 'transparent',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                >
                    RETURN TO DESK
                </button>
            </div>
        </div>
    );
}
