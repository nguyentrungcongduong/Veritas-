'use client';

import { useInvestigationStore } from '@/store/investigationStore';

/**
 * DossierPanel — Cột trái: Hồ sơ nghi phạm.
 * Mỗi suspect là 1 tấm hồ sơ (dossier card).
 * Click vào xem lời khai. Click "Kết tội" chọn suspect.
 */
export default function DossierPanel() {
    const {
        suspects,
        activeSuspectId,
        accusedSuspectId,
        crossedOutSuspectIds,
        setActiveSuspect,
        setAccusedSuspect,
        toggleCrossOutSuspect,
    } = useInvestigationStore();

    const activeSuspect = suspects.find((s) => s.id === activeSuspectId);

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
                ▌ DOSSIER — DANH SÁCH NGHI PHẠM
            </div>

            {/* Hint for interaction */}
            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#888',
                marginBottom: '12px', fontStyle: 'italic', letterSpacing: '0.05em'
            }}>
                * Right-click (chuột phải) để gạch bỏ/hủy gạch bỏ nghi phạm.
            </div>

            {/* Suspect cards */}
            {suspects.map((suspect, idx) => {
                const isActive = activeSuspectId === suspect.id;
                const isAccused = accusedSuspectId === suspect.id;
                const isCrossedOut = crossedOutSuspectIds.includes(suspect.id);

                return (
                    <div key={suspect.id} style={{ marginBottom: '12px' }}>
                        {/* Suspect card */}
                        <div
                            onClick={() => setActiveSuspect(suspect.id)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                toggleCrossOutSuspect(suspect.id);
                            }}
                            style={{
                                border: isAccused
                                    ? '2px solid #c41e1e'
                                    : isActive
                                        ? '2px solid #1a1a1a'
                                        : '1px solid #999',
                                background: isAccused ? '#fef2f2' : '#f2f0e9',
                                padding: '12px 14px',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s',
                                opacity: isCrossedOut ? 0.45 : 1,
                            }}
                        >
                            {/* Cross-out overlay */}
                            {isCrossedOut && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    pointerEvents: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                }}>
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute' }}>
                                        <line x1="5" y1="5" x2="95" y2="95" stroke="#c41e1e" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                                        <line x1="95" y1="5" x2="5" y2="95" stroke="#c41e1e" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                                    </svg>
                                </div>
                            )}

                            {/* Tag number */}
                            <div style={{
                                position: 'absolute',
                                top: '-1px',
                                right: '-1px',
                                background: '#1a1a1a',
                                color: '#f2f0e9',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.6rem',
                                padding: '2px 8px',
                                letterSpacing: '0.1em',
                            }}>
                                SUSPECT #{String(idx + 1).padStart(2, '0')}
                            </div>

                            {/* Name */}
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: '4px',
                                paddingRight: '70px',
                            }}>
                                {suspect.name}
                            </div>

                            {/* Bio */}
                            <div style={{
                                fontSize: '0.78rem',
                                color: '#555',
                                lineHeight: 1.5,
                                borderTop: '1px dashed #ccc',
                                paddingTop: '6px',
                                marginTop: '4px',
                            }}>
                                {suspect.bio}
                            </div>

                            {/* Accuse toggle */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isCrossedOut) setAccusedSuspect(suspect.id);
                                }}
                                disabled={isCrossedOut}
                                style={{
                                    marginTop: '8px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    padding: '4px 10px',
                                    border: isAccused ? '2px solid #c41e1e' : '1px solid #1a1a1a',
                                    background: isAccused ? '#c41e1e' : 'transparent',
                                    color: isAccused ? '#fff' : '#1a1a1a',
                                    cursor: isCrossedOut ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s',
                                    opacity: isCrossedOut ? 0.3 : 1,
                                }}
                            >
                                {isAccused ? '★ KẾT TỘI' : '○ CHỌN ĐỂ KẾT TỘI'}
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Statements panel — hiện khi click suspect */}
            {activeSuspect && (
                <div style={{
                    border: '1px dashed #888',
                    marginTop: '8px',
                    padding: '12px',
                    background: '#faf8f2',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#888',
                        marginBottom: '10px',
                    }}>
                        TRANSCRIPT — LỜI KHAI CỦA {activeSuspect.name.split('(')[0].trim().toUpperCase()}
                    </div>

                    {activeSuspect.statements.map((st, stIdx) => {
                        return (
                            <div
                                key={st.id}
                                style={{
                                    position: 'relative',
                                    background: '#fff',
                                    border: '1px solid #ccc',
                                    padding: '10px 12px',
                                    marginBottom: '8px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.78rem',
                                    lineHeight: 1.6,
                                    /* Typewriter tape effect */
                                    borderLeft: '3px solid #1a1a1a',
                                }}
                            >
                                {/* Statement number tag */}
                                <span style={{
                                    position: 'absolute',
                                    top: '-1px',
                                    left: '-3px',
                                    background: '#555',
                                    color: '#fff',
                                    fontSize: '0.55rem',
                                    padding: '1px 6px',
                                    fontFamily: 'var(--font-mono)',
                                    letterSpacing: '0.08em',
                                }}>
                                    ST-{String(stIdx + 1).padStart(2, '0')}
                                </span>

                                <div style={{ marginTop: '6px' }}>
                                    &ldquo;{st.content}&rdquo;
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
