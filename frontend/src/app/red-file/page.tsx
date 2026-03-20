'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';

interface CaseData {
    id: string;
    title: string;
    description: string;
    difficulty: number;
    reward_fame: number;
    investigations_count: number;
    created_at: string;
}

export default function RedFilePage() {
    const { setRole } = useUserStore();
    const router = useRouter();

    useEffect(() => {
        setRole('DETECTIVE');
    }, [setRole]);

    const { data, isLoading } = useQuery<any>({
        queryKey: ['red-file', 'cases'],
        queryFn: () => api.get('/v1/cases?min_difficulty=4').then(res => res.data),
    });

    return (
        <main style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#f2f0e9', padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.05, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ctext y=\'20\' font-size=\'10\' fill=\'red\'%3ECLASSIFIED CLASSIFIED CLASSIFIED%3C/text%3E%3C/svg%3E")', backgroundSize: '300px' }} />

            <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{ borderBottom: '4px solid #8b1a1a', paddingBottom: '20px', marginBottom: '40px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', color: '#8b1a1a', marginBottom: '8px' }}>
                        [ RESTRICTED AREA — LEVEL 5 CLEARANCE REQUIRED ]
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, textTransform: 'uppercase', color: '#8b1a1a' }}>The Red File</h1>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', opacity: 0.6 }}>
                        These cases are for elite detectives only. One wrong move and the trail goes cold forever.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {isLoading ? (
                        <p style={{ color: '#8b1a1a' }}>Decrypting restricted files...</p>
                    ) : (
                        data?.data?.length === 0 ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', border: '1px dashed #8b1a1a' }}>No high-priority crimes reported... for now.</p>
                        ) : (
                            data?.data?.map((c: CaseData) => (
                                <div key={c.id} style={{ border: '2px solid #8b1a1a', padding: '24px', backgroundColor: '#000', position: 'relative', boxShadow: '0 0 20px rgba(139,26,26,0.2)' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#8b1a1a' }}>{c.title}</h3>
                                    <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '16px', opacity: 0.7 }}>{c.description}</p>
                                    <div style={{ marginBottom: '16px', fontSize: '12px', color: '#8b1a1a' }}>
                                        REWARD: +{c.reward_fame} FAME
                                    </div>
                                    <Link href={`/cases/${c.id}`} style={{ display: 'block', backgroundColor: '#8b1a1a', color: '#fff', textAlign: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' }}>
                                        OPEN RED FILE
                                    </Link>
                                </div>
                            ))
                        )
                    )}
                </div>

                <button onClick={() => router.push('/')} style={{ marginTop: '40px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#8b1a1a', textDecoration: 'underline' }}>
                    ← EXIT RESTRICTED AREA
                </button>
            </div>
        </main>
    );
}
