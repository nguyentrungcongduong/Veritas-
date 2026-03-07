'use client';

import { useEffect, useState } from 'react';
import { useInvestigationStore } from '@/store/investigationStore';
import { useAuthStore } from '@/store/useAuthStore';

// We can play sounds via Web Audio API 
function playHeartbeat() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playBeat = (time: number, freq: number, duration: number, vol: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(freq, time);
            osc.frequency.exponentialRampToValueAtTime(10, time + duration);
            gain.gain.setValueAtTime(vol, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
            osc.start(time);
            osc.stop(time + duration);
        };
        const now = ctx.currentTime;
        playBeat(now, 80, 0.5, 1);
        playBeat(now + 0.3, 90, 0.4, 0.8);
        playBeat(now + 1.0, 80, 0.5, 1);
        playBeat(now + 1.3, 90, 0.4, 0.8);
    } catch (e) { }
}

function playStampSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.type = 'square';
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) { }
}

function playGlitchSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        noise.connect(filter);
        filter.connect(ctx.destination);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.5);
    } catch (e) { }
}

export default function VerdictAnimation() {
    const { verdict } = useInvestigationStore();
    const { checkAuth } = useAuthStore();
    const [phase, setPhase] = useState<'IDLE' | 'SILENCE' | 'RESULT' | 'RECEIPT' | 'DONE'>('IDLE');

    // This runs once when verdict is set
    useEffect(() => {
        if (!verdict) {
            setPhase('IDLE');
            return;
        }

        // Start animation
        setPhase('SILENCE');
        playHeartbeat();

        const t1 = setTimeout(() => {
            setPhase('RESULT');
            if (verdict.verdict === 'CASE_SOLVED') {
                playStampSound();
            } else {
                playGlitchSound();
            }
        }, 2000); // 2 seconds of silence/heartbeat

        const t2 = setTimeout(() => {
            setPhase('RECEIPT');
            // Update auth store fame so header updates immediately
            checkAuth(); // Refetches from local storage if updated, but API update takes precedence. 
            // In a better setup we'd update `useAuthStore` user directly. Let's rely on checkAuth or just let the user see it locally.
        }, 4000); // 2s after result shows

        const t3 = setTimeout(() => {
            setPhase('DONE'); // Then it disappears or shrinks to banner
        }, 8000);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [verdict, checkAuth]);

    if (!verdict || phase === 'IDLE' || phase === 'DONE') return null;

    const isSuccess = verdict.verdict === 'CASE_SOLVED';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: phase === 'SILENCE' ? '#050505' : 'rgba(10,10,10,0.9)',
            transition: 'background-color 0.5s ease',
            pointerEvents: 'all',
            overflow: 'hidden',
        }}>
            <style>{`
                @keyframes heartbeat {
                    0% { transform: scale(1); opacity: 0; }
                    10% { transform: scale(1.1); opacity: 0.1; }
                    20% { transform: scale(1); opacity: 0; }
                    50% { transform: scale(1.2); opacity: 0.2; }
                    60% { transform: scale(1); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
                @keyframes stampDown {
                    0% { transform: scale(3) rotate(-15deg); opacity: 0; }
                    50% { transform: scale(0.8) rotate(-2deg); opacity: 1; }
                    100% { transform: scale(1) rotate(-5deg); opacity: 1; }
                }
                @keyframes glitchResult {
                    0% { clip-path: inset(10% 0 80% 0); transform: translateX(-10px); }
                    20% { clip-path: inset(80% 0 10% 0); transform: translateX(10px); color: red; }
                    40% { clip-path: inset(30% 0 50% 0); transform: translateX(-5px); }
                    60% { clip-path: inset(50% 0 30% 0); transform: translateX(5px); color: white; }
                    80% { clip-path: inset(20% 0 60% 0); transform: translateX(-10px); }
                    100% { clip-path: inset(0 0 0 0); transform: translateX(0); }
                }
                @keyframes receiptSlide {
                    0% { transform: translateY(100vh); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            {/* Phase 1: Silence */}
            {phase === 'SILENCE' && (
                <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    background: 'radial-gradient(circle, rgba(196,30,30,0.2) 0%, transparent 60%)',
                    animation: 'heartbeat 1.5s infinite'
                }} />
            )}

            {/* Phase 2: Result Stamp / Glitch */}
            {(phase === 'RESULT' || phase === 'RECEIPT') && (
                <div style={{ position: 'relative', zIndex: 10 }}>
                    {isSuccess ? (
                        <div style={{
                            fontFamily: 'var(--font-body)', fontSize: '8vw', fontWeight: 900,
                            color: '#c41e1e', border: '8px solid #c41e1e', padding: '10px 40px',
                            textTransform: 'uppercase', letterSpacing: '-0.02em',
                            animation: 'stampDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
                            boxShadow: '0 0 40px rgba(196,30,30,0.5)',
                            textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                        }}>
                            CASE CLOSED
                        </div>
                    ) : (
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '4vw', fontWeight: 'bold',
                            color: '#fff', textTransform: 'uppercase', letterSpacing: '0.2em',
                            animation: 'glitchResult 0.5s ease-in-out',
                            textAlign: 'center',
                        }}>
                            [ INVESTIGATION FAILED ]<br />
                            <span style={{ color: '#c41e1e', fontSize: '6vw' }}>SUBJECT ESCAPED</span>
                        </div>
                    )}
                </div>
            )}

            {/* Phase 3: Payout Receipt */}
            {phase === 'RECEIPT' && (
                <div style={{
                    position: 'absolute', bottom: '10%', zIndex: 20,
                    background: '#f2f0e9', padding: '30px 40px',
                    width: '320px', borderTop: '4px dashed #1a1a1a',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                    animation: 'receiptSlide 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '12px',
                        color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.1em',
                        textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #1a1a1a',
                        paddingBottom: '10px',
                    }}>
                        METROPOLITAN DETECTIVE BUREAU<br />
                        PAYOUT RECEIPT
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '10px', color: '#333' }}>
                        <span>RESULT:</span>
                        <span style={{ fontWeight: 'bold' }}>{isSuccess ? 'SUCCESS' : 'FAILURE'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '10px', color: '#333' }}>
                        <span>BASE REWARD:</span>
                        <span>{isSuccess ? verdict.fame_earned || 0 : (verdict.penalty ? `-${verdict.penalty}` : 0)} FAME</span>
                    </div>

                    {isSuccess && verdict.details?.score && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '10px', color: '#333' }}>
                            <span>LOGIC SCORE:</span>
                            <span>{verdict.details.score} PTS</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '14px', marginTop: '20px', paddingTop: '10px', borderTop: '2px dashed #1a1a1a', color: '#1a1a1a', fontWeight: 'bold' }}>
                        <span>NEW BALANCE:</span>
                        <span>{verdict.new_total_fame || 'N/A'} FAME</span>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '30px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888' }}>
                        [ CLICK ANYWHERE TO DISMISS ]
                    </div>
                </div>
            )}

            {/* Overlay click to dismiss early if receipt is shown */}
            {phase === 'RECEIPT' && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 30 }} onClick={() => setPhase('DONE')} />
            )}
        </div>
    );
}
