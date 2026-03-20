'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import FlashMysteryCard from '@/components/FlashMysteryCard';
import { useRouter } from 'next/navigation';

export default function FlashMysteryFeedPage() {
    const router = useRouter();
    const { data, isLoading } = useQuery<any>({
        queryKey: ['flash-cases'],
        queryFn: () => api.get('/v1/flash-cases').then(res => res.data),
    });

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '40px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px', borderBottom: '3px solid var(--charcoal)', paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>⚡ Flash Mysteries</h1>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', opacity: 0.6 }}>Solve these quick cases to earn Fame. Use your intuition.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', justifyItems: 'center' }}>
                    {isLoading ? (
                        <p>Scanning crime scenes...</p>
                    ) : (
                        data?.data?.map((c: any) => (
                            <FlashMysteryCard
                                key={c.id}
                                caseTitle={c.title}
                                description={c.description}
                                imageUrl={c.image_url}
                                options={c.options}
                                correctIndex={c.correct_index}
                                onResult={(isCorrect) => {
                                    if (isCorrect) alert('Excellent work, Detective! Fame increased.');
                                }}
                            />
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
