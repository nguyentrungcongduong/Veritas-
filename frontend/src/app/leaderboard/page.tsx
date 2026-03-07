'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DetectiveRecord {
    id: number;
    name: string;
    alias: string;
    fame: number;
    streak: number;
    solve_count: number;
    rank: string;
}

interface CriminalRecord {
    id: number;
    name: string;
    alias: string;
    prestige: number;
    cases_created: number;
    ranking: string;
}

export default function LeaderboardPage() {
    const [detectives, setDetectives] = useState<DetectiveRecord[]>([]);
    const [criminals, setCriminals] = useState<CriminalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/v1/leaderboard');
                setDetectives(res.data.detectives || []);
                setCriminals(res.data.criminals || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="dossier-loading">
                [ LOADING HALL OF RECORDS... ]
            </div>
        );
    }

    return (
        <div className="hall-of-records-page">
            <button
                onClick={() => router.push('/')}
                className="dossier-back-btn"
                style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 100 }}
            >
                ← RETURN TO HEADQUARTERS
            </button>

            <header className="records-header">
                <h1 className="records-title">THE HALL OF RECORDS</h1>
                <p className="records-subtitle">Classified Intelligence - Restricted Access - {new Date().toLocaleDateString('vi-VN')}</p>
                <div className="records-header-line" />
            </header>

            <div className="records-grid">
                {/* ── THE LAW (Detectives) ─────────────────────────────────── */}
                <section className="records-section law-section">
                    <div className="records-section-header law-header">
                        <h2>HONOR ROLL</h2>
                        <span className="records-label text-ink-light">FAME RANKING</span>
                    </div>

                    <div className="records-list">
                        {detectives.length === 0 ? (
                            <div className="records-empty">[ No records found ]</div>
                        ) : detectives.map((det, idx) => (
                            <div key={det.id} className="record-card law-card">
                                <span className="record-rank law-rank">#{idx + 1}</span>
                                <div className="record-info">
                                    <div className="record-name">{det.alias || det.name}</div>
                                    <div className="record-title">{det.rank || 'Registered Agent'}</div>
                                </div>
                                <div className="record-stats">
                                    <div className="record-score law-score">{det.fame.toLocaleString()} FAME</div>
                                    <div className="record-sub-stats">CASES: {det.solve_count}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── THE UNDERGROUND (Criminals) ─────────────────────────── */}
                <section className="records-section crime-section">
                    <div className="records-section-header crime-header">
                        <h2>MOST WANTED</h2>
                        <span className="records-label text-red">PRESTIGE RANKING</span>
                    </div>

                    <div className="records-list">
                        {criminals.length === 0 ? (
                            <div className="records-empty">[ The streets are quiet... for now ]</div>
                        ) : criminals.map((crim, idx) => (
                            <div key={crim.id} className="record-card crime-card">
                                {idx === 0 && (
                                    <div className="wanted-stamp">
                                        MOST WANTED
                                    </div>
                                )}
                                <span className="record-rank crime-rank">#{idx + 1}</span>
                                <div className="record-info">
                                    <div className="record-name text-red-bright">{crim.alias || crim.name}</div>
                                    <div className="record-title">{crim.ranking || 'Suspect'}</div>
                                </div>
                                <div className="record-stats">
                                    <div className="record-score crime-score">{crim.prestige.toLocaleString()} BOUNTY</div>
                                    <div className="record-sub-stats">CRIMES: {crim.cases_created}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
