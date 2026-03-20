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

export default function AcademyPage() {
    const { setRole } = useUserStore();
    const router = useRouter();

    useEffect(() => {
        setRole('DETECTIVE');
    }, [setRole]);

    const { data, isLoading } = useQuery<any>({
        queryKey: ['academy', 'cases'],
        queryFn: () => api.get('/v1/cases?max_difficulty=2').then(res => res.data),
    });

    return (
        <main style={{ minHeight: '100vh', backgroundColor: '#f2f0e9', color: '#1a1a1a', padding: '40px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ borderBottom: '4px solid #1a1a1a', paddingBottom: '20px', marginBottom: '40px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', color: '#2d4a1a', marginBottom: '8px' }}>
                        [ RECRUIT TRAINING FACILITY ]
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, textTransform: 'uppercase' }}>The Academy</h1>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', opacity: 0.6 }}>
                        Master the art of deduction. Start with these training files.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {isLoading ? (
                        <p>Accessing training records...</p>
                    ) : (
                        data?.data?.map((c: CaseData) => (
                            <div key={c.id} style={{ border: '2px solid #1a1a1a', padding: '24px', backgroundColor: '#fff', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', left: '10px', backgroundColor: '#2d4a1a', color: '#fff', fontSize: '9px', padding: '2px 8px', fontWeight: 'bold' }}>TUTORIAL</div>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{c.title}</h3>
                                <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '16px', opacity: 0.7 }}>{c.description}</p>
                                <Link href={`/cases/${c.id}`} style={{ display: 'block', backgroundColor: '#1a1a1a', color: '#fff', textAlign: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' }}>
                                    START TRAINING
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                <button onClick={() => router.push('/')} style={{ marginTop: '40px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', textDecoration: 'underline' }}>
                    ← RETURN TO HOME
                </button>
            </div>
        </main>
    );
}
