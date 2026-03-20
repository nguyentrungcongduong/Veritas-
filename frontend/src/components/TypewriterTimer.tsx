'use client';

import { useState, useEffect } from 'react';

interface TypewriterTimerProps {
    duration: number; // in seconds
    onTimeUp?: () => void;
    isActive?: boolean;
}

export default function TypewriterTimer({ duration, onTimeUp, isActive = true }: TypewriterTimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isLow, setIsLow] = useState(false);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isActive, onTimeUp]);

    useEffect(() => {
        if (timeLeft <= 30) {
            setIsLow(true);
        } else {
            setIsLow(false);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const timeStr = formatTime(timeLeft);

    return (
        <div
            style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                padding: '12px 20px',
                border: isLow ? '3px solid var(--red-bright)' : '2px solid var(--charcoal)',
                backgroundColor: isLow ? 'rgba(139, 26, 26, 0.1)' : 'transparent',
                position: 'relative',
                transform: isLow ? 'rotate(-2deg)' : 'none',
                transition: 'all 0.3s ease',
                boxShadow: isLow ? '0 0 15px rgba(196, 30, 30, 0.4)' : 'none',
                userSelect: 'none'
            }}
            className={isLow ? 'glitch-active' : ''}
        >
            {/* Stamp Label */}
            <div style={{
                position: 'absolute',
                top: '-10px',
                left: '10px',
                backgroundColor: isLow ? 'var(--red-bright)' : 'var(--charcoal)',
                color: '#fff',
                fontSize: '9px',
                padding: '2px 6px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.2em'
            }}>
                {isLow ? 'CRITICAL TIME' : 'STAMP_TIME_REMAINING'}
            </div>

            <div style={{
                fontSize: '32px',
                fontWeight: '900',
                color: isLow ? 'var(--red-bright)' : 'var(--ink)',
                letterSpacing: '0.1em',
                textShadow: isLow ? '2px 2px 0px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {timeStr.split('').map((char, i) => (
                    <span key={i} style={{
                        display: 'inline-block',
                        animation: isActive ? `tick 1s infinite ${i * 0.05}s` : 'none'
                    }}>
                        {char}
                    </span>
                ))}
            </div>

            {isLow && (
                <div style={{
                    fontSize: '10px',
                    color: 'var(--red-bright)',
                    marginTop: '4px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    [!] ACCURACY DROPPING
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes tick {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.9; }
                    }
                    
                    .glitch-active {
                        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite;
                    }

                    @keyframes shake {
                        10%, 90% { transform: translate3d(-1px, 0, 0) rotate(-2deg); }
                        20%, 80% { transform: translate3d(2px, 0, 0) rotate(-2deg); }
                        30%, 50%, 70% { transform: translate3d(-4px, 0, 0) rotate(-2deg); }
                        40%, 60% { transform: translate3d(4px, 0, 0) rotate(-2deg); }
                    }
                `
            }} />
        </div>
    );
}
