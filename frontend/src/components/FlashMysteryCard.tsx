'use client';

import { useState, useEffect } from 'react';

interface FlashMysteryProps {
    caseTitle: string;
    description: string;
    imageUrl?: string;
    options: string[];
    correctIndex: number;
    onResult: (isCorrect: boolean) => void;
}

export default function FlashMysteryCard({
    caseTitle,
    description,
    imageUrl,
    options,
    correctIndex,
    onResult
}: FlashMysteryProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (isRevealed) return;
        const interval = setInterval(() => {
            setTimer(t => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [isRevealed]);

    const handleAnswer = (index: number) => {
        if (isRevealed) return;
        setSelected(index);
        setIsRevealed(true);
        onResult(index === correctIndex);
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'var(--paper)',
            border: '4px solid var(--charcoal)',
            padding: '24px',
            boxShadow: '10px 10px 0px var(--charcoal)',
            fontFamily: 'var(--font-mono)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header / Timer */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '2px solid var(--charcoal)',
                paddingBottom: '8px',
                marginBottom: '16px',
                fontSize: '11px',
                fontWeight: 'bold'
            }}>
                <span>FLASH_MYSTERY_NO_{Math.floor(Math.random() * 999)}</span>
                <span style={{ color: timer < 10 ? 'var(--red-bright)' : 'inherit' }}>
                    TIME: {timer}s
                </span>
            </div>

            {/* Case Content */}
            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '12px', textTransform: 'uppercase' }}>
                {caseTitle}
            </h3>

            {imageUrl && (
                <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#ddd',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '2px solid var(--charcoal)',
                    marginBottom: '16px',
                    filter: 'grayscale(100%) contrast(120%)'
                }} />
            )}

            <p style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '20px', color: 'var(--ink)' }}>
                {description}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {options.map((opt, idx) => {
                    let bgColor = 'transparent';
                    let borderColor = 'var(--charcoal)';
                    let textColor = 'var(--charcoal)';

                    if (isRevealed) {
                        if (idx === correctIndex) {
                            bgColor = 'rgba(45, 74, 26, 0.2)';
                            borderColor = '#2d4a1a';
                            textColor = '#2d4a1a';
                        } else if (idx === selected) {
                            bgColor = 'rgba(139, 26, 26, 0.2)';
                            borderColor = '#8b1a1a';
                            textColor = '#8b1a1a';
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => {
                                handleAnswer(idx);
                                if (idx === correctIndex) {
                                    // Add a little alert if correct for immediate feedback
                                    setTimeout(() => alert('ACCURATE DEDUCTION! 🕵️‍♂️'), 100);
                                }
                            }}
                            disabled={isRevealed}
                            style={{
                                padding: '14px',
                                textAlign: 'left',
                                backgroundColor: bgColor,
                                border: `2px solid ${borderColor}`,
                                color: textColor,
                                fontSize: '13px',
                                cursor: isRevealed ? 'default' : 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                fontWeight: selected === idx ? 'bold' : 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transform: selected === idx ? 'scale(1.02)' : 'none',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!isRevealed) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isRevealed) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <span style={{ opacity: 0.5 }}>{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                            {isRevealed && idx === correctIndex && <span style={{ marginLeft: 'auto' }}>✓</span>}
                            {isRevealed && idx === selected && idx !== correctIndex && <span style={{ marginLeft: 'auto' }}>✗</span>}
                        </button>
                    );
                })}
            </div>

            {/* Result Message */}
            {isRevealed && (
                <div style={{
                    marginTop: '20px',
                    padding: '8px',
                    textAlign: 'center',
                    border: `2px dashed ${selected === correctIndex ? 'var(--evidence-tag)' : 'var(--red)'}`,
                    color: selected === correctIndex ? 'var(--evidence-tag)' : 'var(--red)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    animation: 'stampIn 0.3s ease-out'
                }}>
                    {selected === correctIndex ? 'VERDICT: ACCURATE - FAME +50' : 'VERDICT: FLAWED - PENALTY APPLIED'}
                </div>
            )}
        </div>
    );
}
