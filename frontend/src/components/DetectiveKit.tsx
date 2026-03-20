'use client';

import { useState } from 'react';

interface Gadget {
    id: string;
    name: string;
    description: string;
    icon: string;
    charges: number;
    penalty: string;
}

const GADGETS: Gadget[] = [
    {
        id: 'glasses',
        name: 'SCANNING GLASSES',
        description: 'Highlights a potential lie in a suspect statement.',
        icon: '🧐',
        charges: 1,
        penalty: '-20% Accuracy'
    },
    {
        id: 'lens',
        name: 'MAGNIFYING LENS',
        description: 'Shows links between a clue and possible statements.',
        icon: '🔍',
        charges: 2,
        penalty: '-15% Accuracy'
    },
    {
        id: 'changer',
        name: 'VOICE CHANGER',
        description: 'Eliminates one innocent suspect from the file.',
        icon: '🤐',
        charges: 1,
        penalty: '-50% Fame reward'
    },
    {
        id: 'tracker',
        name: 'SIGNAL TRACKER',
        description: 'Reveals the count of undiscovered contradictions.',
        icon: '📡',
        charges: 1,
        penalty: '-30% Accuracy'
    }
];

export default function DetectiveKit() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedGadget, setSelectedGadget] = useState<Gadget | null>(null);

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
            {/* The Briefcase (Closed/Open Trigger) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'var(--charcoal)',
                    border: '3px solid var(--paper-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isOpen ? 'rotate(180deg) scale(0.9)' : 'scale(1)',
                    position: 'relative'
                }}
                title="Open Detective Kit"
            >
                💼
                {/* Notification Badge */}
                {!isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: 'var(--red-bright)',
                        color: '#fff',
                        fontSize: '10px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        border: '2px solid var(--paper)'
                    }}>
                        4
                    </div>
                )}
            </button>

            {/* Gadget Tray */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: '0',
                    width: '300px',
                    backgroundColor: 'var(--paper)',
                    border: '4px solid var(--charcoal)',
                    padding: '16px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--ink-light)',
                        borderBottom: '1px solid var(--border-light)',
                        paddingBottom: '8px',
                        marginBottom: '12px',
                        letterSpacing: '0.2em',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <span>[ DETECTIVE_GEAR_V.2 ]</span>
                        <span>OFFLINE_MODE</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {GADGETS.map((gadget) => (
                            <div
                                key={gadget.id}
                                onMouseEnter={() => setSelectedGadget(gadget)}
                                onMouseLeave={() => setSelectedGadget(null)}
                                style={{
                                    border: '2px solid var(--charcoal)',
                                    padding: '12px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: selectedGadget?.id === gadget.id ? 'var(--paper-dark)' : 'transparent',
                                    transition: 'background 0.2s',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{gadget.icon}</div>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                    lineHeight: '1.2'
                                }}>
                                    {gadget.name.split(' ').join('\n')}
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '4px',
                                    fontSize: '8px',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--red)'
                                }}>
                                    x{gadget.charges}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Gadget Detail / Tooltip */}
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: 'var(--charcoal)',
                        color: 'var(--paper)',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        {selectedGadget ? (
                            <>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'var(--yellow-warn)',
                                    marginBottom: '4px'
                                }}>
                                    {selectedGadget.name}
                                </div>
                                <div style={{ fontSize: '11px', lineHeight: '1.4', marginBottom: '8px' }}>
                                    {selectedGadget.description}
                                </div>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '9px',
                                    color: 'var(--red-bright)',
                                    fontStyle: 'italic'
                                }}>
                                    COST: {selectedGadget.penalty}
                                </div>
                            </>
                        ) : (
                            <div style={{
                                fontSize: '11px',
                                opacity: 0.5,
                                textAlign: 'center',
                                fontStyle: 'italic'
                            }}>
                                SELECT_EQUIPMENT_FOR_ANALYSIS
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `
            }} />
        </div>
    );
}
