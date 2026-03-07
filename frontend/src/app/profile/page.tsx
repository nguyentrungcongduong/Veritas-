'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

interface UserProfile {
    id: string;
    name: string;
    alias: string;
    rank: string;
    fame: number;
    prestige: number;
    solved_count: number;
    created_count: number;
    fooled_count: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            const timer = setTimeout(() => {
                if (!localStorage.getItem('veritas_token')) {
                    router.push('/auth');
                }
            }, 500);
            return () => clearTimeout(timer);
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get('/v1/profile');
                setProfile(res.data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, router]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        // Play woosh sound
        try {
            const audio = new Audio('/sounds/woosh.mp3'); // Mock woosh if file exists
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) { }
    };

    if (loading || !profile) {
        return (
            <div className="dossier-loading">
                LOADING DOSSIER . . .
            </div>
        );
    }

    return (
        <div className="dossier-page">
            <button
                onClick={() => router.push('/')}
                className="dossier-back-btn"
            >
                ← RETURN TO HEADQUARTERS
            </button>

            <div className="dossier-helper">
                [ CLICK DOSSIER TO REVEAL ALTERNATE IDENTITY ]
            </div>

            <div className="dossier-card-container" onClick={handleFlip}>
                <div className={`dossier-card-inner ${isFlipped ? 'is-flipped' : ''}`}>

                    {/* ════════════ MẶT TRƯỚC: THE LAW ════════════ */}
                    <div className="dossier-front">
                        {/* Header */}
                        <div className="dossier-header">
                            <div className="dossier-header-title">
                                <h2>METROPOLITAN</h2>
                                <h2>DETECTIVE BUREAU</h2>
                            </div>
                            <div className="dossier-badge">
                                <span className="dossier-badge-star">★</span>
                            </div>
                        </div>

                        {/* Photo & Name */}
                        <div className="dossier-body">
                            <div className="dossier-photo">
                                <div className="noir-grain" />
                                <img
                                    src="/images/sherlock.jpg"
                                    alt="Agent Photo"
                                    className="dossier-photo-img"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (next) next.style.display = 'block';
                                    }}
                                />
                                <div className="dossier-photo-text" style={{ display: 'none' }}>NO PHOTO ON FILE</div>
                            </div>

                            <div className="dossier-info">
                                <p className="dossier-label">REGISTERED AGENT</p>
                                <h1 className="dossier-name">{profile.alias}</h1>
                                <p className="dossier-rank">
                                    {profile.rank || 'ROOKIE'}
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="dossier-stats">
                            <div className="dossier-stat-col">
                                <span className="dossier-label">TOTAL FAME</span>
                                <span className="dossier-stat-val">{profile.fame}</span>
                            </div>
                            <div className="dossier-stat-col">
                                <span className="dossier-label">CASES SOLVED</span>
                                <span className="dossier-stat-val">{profile.solved_count}</span>
                            </div>
                        </div>

                        {/* Signature Area */}
                        <div className="dossier-signature">
                            <div className="dossier-sig-box">
                                <div className="dossier-sig-text">
                                    Approved
                                </div>
                                <div className="dossier-sig-line" />
                                <div className="dossier-sig-title">CHIEF OF POLICE</div>
                            </div>
                        </div>
                    </div>

                    {/* ════════════ MẶT SAU: THE CRIME ════════════ */}
                    <div className="dossier-back">
                        <div className="noir-grain" />

                        {/* Header */}
                        <div className="dossier-crime-header">
                            <h2>MOST WANTED</h2>
                        </div>

                        {/* Photo & Name */}
                        <div className="dossier-body">
                            <div className="dossier-crime-photo">
                                <div className="dossier-crime-photo-overlay" />
                                <img
                                    src="/images/joker .jpg"
                                    alt="Criminal Bio"
                                    className="dossier-crime-photo-img"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (next) next.style.display = 'block';
                                    }}
                                />
                                <div className="dossier-crime-photo-text" style={{ display: 'none' }}>
                                    REDACTED
                                </div>
                            </div>

                            <div className="dossier-info">
                                <p className="dossier-crime-label">KNOWN ALIAS</p>
                                <h1 className="dossier-crime-name">
                                    {profile.alias}
                                </h1>
                                <p className="dossier-crime-sub">
                                    "The Mastermind Behind The Void..."
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="dossier-crime-stats">
                            <div className="dossier-stat-col">
                                <span className="dossier-crime-label">CRIMINAL PRESTIGE</span>
                                <span className="dossier-crime-stat-val">{profile.prestige}</span>
                            </div>
                            <div className="dossier-stat-col">
                                <span className="dossier-crime-label">HEISTS CREATED</span>
                                <span className="dossier-crime-stat-val">{profile.created_count}</span>
                            </div>
                        </div>

                        <div className="dossier-fooled-box">
                            <span className="dossier-fooled-label">DETECTIVES FOOLED:</span>
                            <span className="dossier-fooled-val">{profile.fooled_count}</span>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
