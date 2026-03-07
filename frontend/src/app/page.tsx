'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useState } from 'react';
import TransitionOverlay from '@/components/TransitionOverlay';
import NotificationBell from '@/components/NotificationBell';

interface TrendingCase {
  id: string;
  title: string;
  description: string;
  date: string;
  difficulty: number;
  solve_rate: string;
  reward: number;
}

interface HomeData {
  bulletin_date: string;
  cases: TrendingCase[];
  pagination: {
    current_page: number;
    last_page: number;
  };
  stats: {
    cases_solved: number;
    most_wanted: number;
    active_agents: number;
  };
}

export default function HomePage() {
  const router = useRouter();
  const { setRole } = useUserStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState<string>('all');

  const handleIdentityChange = (role: 'DETECTIVE' | 'CRIMINAL', path: string) => {
    setRole(role);
    setIsTransitioning(true);
    // Play a dramatic visual overlay for 1.2 seconds before navigating
    setTimeout(() => {
      router.push(path);
      setIsTransitioning(false); // Reset in case user goes back
    }, 1200);
  };

  const { data, isLoading, isFetching } = useQuery<HomeData>({
    queryKey: ['home', 'trending', page, difficulty],
    queryFn: () => api.get(`/v1/home/trending?page=${page}&difficulty=${difficulty}`).then(res => res.data),
  });

  const { data: dossierData } = useQuery<any>({
    queryKey: ['daily-dossier'],
    queryFn: () => api.get('/v1/daily-dossier').then(res => res.data),
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        PRINTING DAILY BULLETIN ...
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <TransitionOverlay isTransitioning={isTransitioning} />
      <main style={{
        minHeight: '100vh',
        backgroundColor: 'var(--paper)',
        color: 'var(--charcoal)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        // Noise texture
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")'
      }}>
        <div style={{
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          border: '3px solid var(--charcoal)',
          backgroundColor: 'var(--paper)',
        }}>

          {/* ── Newspaper Header ─────────────────────────────────────── */}
          <header style={{ padding: '24px 24px 8px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em',
              marginBottom: '16px', borderBottom: '1px solid var(--charcoal)', paddingBottom: '8px'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span>VOL. 001 - NO. 01</span>
                <NotificationBell />
              </div>
              <span>PRICE: YOUR REASONING</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-body)', // Using body for now if serif not available
              fontSize: '80px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em', lineHeight: 1,
              marginBottom: '16px', marginTop: '32px', transform: 'scaleY(1.2)'
            }}>
              THE DAILY DEDUCTION
            </h1>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--charcoal)', marginBottom: '4px' }} />
            <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--charcoal)', marginBottom: '16px' }} />

            <p style={{
              fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '14px', color: 'rgba(26,26,26,0.8)', fontWeight: 'bold', letterSpacing: '0.05em',
              marginBottom: '24px'
            }}>
              "All truths are easy to understand once they are discovered; the point is to discover them."
            </p>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--charcoal)', marginBottom: '24px' }} />
          </header>

          {/* ── Daily Dossier Headline ─────────────────────────────────────── */}
          {dossierData?.case && (
            <div style={{
              padding: '32px', margin: '0 24px 32px 24px',
              border: '4px solid var(--red-bright)',
              backgroundColor: 'var(--paper-dark)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
              onClick={() => handleIdentityChange('DETECTIVE', `/cases/${dossierData.case.id}`)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--paper)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--paper-dark)'}
            >
              {/* Background Cross/Watermark */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, fontSize: '200px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red-bright)', pointerEvents: 'none', transform: 'rotate(-10deg)', lineHeight: 1 }}>
                FAILED
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold', color: 'var(--red-bright)', letterSpacing: '0.3em', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <span className="blink-text" style={{ animation: 'blink 1.5s infinite' }}>[ 2X REWARDS ACTIVE ]</span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '48px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--charcoal)', marginBottom: '8px', lineHeight: 1.1 }}>
                THE CASE THAT NO ONE CAN SOLVE
              </h2>

              <div style={{ margin: '24px auto', width: '80%', height: '2px', backgroundColor: 'var(--charcoal)' }} />

              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px' }}>
                {dossierData.case.title}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', fontFamily: 'var(--font-mono)', fontSize: '14px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'var(--charcoal)', color: 'var(--paper)', padding: '4px 12px', fontWeight: 'bold' }}>
                  DIFFICULTY: {"★".repeat(dossierData.case.difficulty)}{"☆".repeat(5 - dossierData.case.difficulty)}
                </div>
                <div style={{ backgroundColor: 'var(--red-bright)', color: 'var(--paper)', padding: '4px 12px', fontWeight: 'bold' }}>
                  DETECTIVES FAILED: {dossierData.failed_count}
                </div>
              </div>

              <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
                {dossierData.case.description}
              </p>
            </div>
          )}

          {/* ── Choose Your Fate ─────────────────────────────────────── */}
          <div style={{
            padding: '0 24px', marginBottom: '32px', marginTop: '16px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0',
            borderTop: '1px solid var(--charcoal)', borderBottom: '1px solid var(--charcoal)'
          }}>

            {/* THE LAW */}
            <div style={{
              padding: '48px', borderRight: '1px solid var(--charcoal)', position: 'relative', cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--paper-dark)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ width: '32px', height: '32px', marginBottom: '16px', border: '2px solid var(--charcoal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>U</div>
              <h2 style={{ fontSize: '30px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>THE LAW</h2>
              <p style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', lineHeight: 1.6, maxWidth: '300px', marginBottom: '48px' }}>
                The truth is hidden in the details. Examine the evidence. Find the contradictions. Bring justice.
              </p>
              <button
                onClick={() => handleIdentityChange('DETECTIVE', '/agency')}
                style={{
                  backgroundColor: 'var(--charcoal)', color: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none'
                }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid var(--paper)' }}></span>
                ENTER THE AGENCY
              </button>

              <div style={{ position: 'absolute', bottom: '16px', left: '48px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(26,26,26,0.3)', display: 'flex', gap: '16px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                <span>dark clues</span><span>suspects</span><span>resolution</span><span>truth</span>
              </div>
            </div>

            {/* THE CRIME */}
            <div style={{
              padding: '48px', backgroundColor: 'var(--charcoal)', color: 'var(--paper)', position: 'relative', cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#000'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--charcoal)'}
            >
              <div style={{ width: '32px', height: '32px', marginBottom: '16px', border: '2px solid var(--red-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--red-bright)' }}>💀</div>
              <h2 style={{ fontSize: '30px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em', color: '#fff' }}>THE CRIME</h2>
              <p style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', lineHeight: 1.6, maxWidth: '300px', marginBottom: '48px', color: 'rgba(242,240,233,0.8)' }}>
                The perfect crime doesn't exist. Prove them wrong. Design the alibi. Plant the evidence. Watch them fall.
              </p>
              <button
                onClick={() => handleIdentityChange('CRIMINAL', '/planner')}
                style={{
                  backgroundColor: 'var(--red-bright)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none'
                }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #fff' }}></span>
                PLAN A HEIST
              </button>

              <div style={{ position: 'absolute', bottom: '16px', left: '48px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(242,240,233,0.2)', display: 'flex', gap: '16px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                <span>alibi</span><span>deception</span><span>misdirection</span><span>shadows</span>
              </div>
            </div>
          </div>

          {/* ── Global Stats ─────────────────────────────────────── */}
          <div style={{ padding: '0 24px', marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto 48px auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--charcoal)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '18px', letterSpacing: '0.2em', padding: '4px 16px', fontWeight: 'bold' }}>
                1 2 . 4 0 9
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>CASES SOLVED</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--charcoal)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '18px', letterSpacing: '0.2em', padding: '4px 16px', fontWeight: 'bold' }}>
                4 5 2
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>CRIMINALS AT LARGE</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--charcoal)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '18px', letterSpacing: '0.2em', padding: '4px 16px', fontWeight: 'bold' }}>
                1 . 0 2 3
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>ACTIVE INVESTIGATORS</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--charcoal)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '18px', letterSpacing: '0.2em', padding: '4px 16px', fontWeight: 'bold' }}>
                3 3 %
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>AVG SOLVE RATE</div>
            </div>
          </div>

          {/* ── Main 3 Columns ─────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(400px, 2fr) minmax(250px, 1fr)', borderTop: '3px solid var(--charcoal)' }}>

            {/* Left Column */}
            <aside style={{ padding: '24px', borderRight: '3px solid var(--charcoal)' }}>

              <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--red-bright)' }}>💀</span> MOST WANTED
                </h2>
                <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--charcoal)', marginBottom: '16px' }} />
                <ul style={{
                  listStyle: 'none', padding: 0, margin: 0,
                  display: 'flex', flexDirection: 'column', gap: '16px',
                  fontFamily: 'var(--font-mono)', fontSize: '12px'
                }}>
                  {['Mastermind_X', 'ShadowArchitect', 'PerfectCrime', 'GhostWriter', 'CrimeLord42'].map((name, i) => (
                    <li key={name} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      <span style={{ color: 'var(--red-bright)', fontWeight: 'bold' }}>#{i + 1}</span>
                      <span style={{ fontWeight: 'bold', flex: 1, borderBottom: '1px dashed rgba(26,26,26,0.3)', paddingBottom: '2px' }}>{name}</span>
                      <span>{95 - i * 5 - (i > 1 ? 3 : 0)}%</span>
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginTop: '16px', color: 'rgba(26,26,26,0.6)' }}>
                  TRAP RATE = % DETECTIVES FAILED
                </div>
              </section>

              <section>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--yellow-warn)' }}>🏆</span> TOP AGENCIES
                </h2>
                <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--charcoal)', marginBottom: '16px' }} />
                <ul style={{
                  listStyle: 'none', padding: 0, margin: 0,
                  display: 'flex', flexDirection: 'column', gap: '16px',
                  fontFamily: 'var(--font-mono)', fontSize: '12px'
                }}>
                  {[
                    { n: 'SherlockNet', s: '24' },
                    { n: 'IronLogic', s: '19' },
                    { n: 'ColdCase_Q', s: '15' },
                    { n: 'Deductor', s: '12' },
                    { n: 'TruthSeeker', s: '10' }
                  ].map((item, i) => (
                    <li key={item.n} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      <span style={{ fontWeight: 'bold' }}>#{i + 1}</span>
                      <span style={{ fontWeight: 'bold', flex: 1, borderBottom: '1px dashed rgba(26,26,26,0.3)', paddingBottom: '2px' }}>{item.n}</span>
                      <span style={{ color: 'var(--yellow-warn)', fontWeight: 'bold' }}>{item.s}🔥</span>
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginTop: '16px', color: 'rgba(26,26,26,0.6)' }}>
                  STREAK = COLD CASES SOLVED
                </div>
              </section>
            </aside>

            {/* Center Column */}
            <section style={{ padding: '24px', borderRight: '3px solid var(--charcoal)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', backgroundColor: 'var(--charcoal)', color: '#fff', display: 'inline-block', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  OPEN INVESTIGATIONS
                </h2>

                {/* Filter */}
                <select
                  value={difficulty}
                  onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '4px 8px', border: '1px solid var(--charcoal)', backgroundColor: 'var(--paper)', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', outline: 'none'
                  }}
                >
                  <option value="all">ALL DIFFICULTIES</option>
                  <option value="1">★☆☆☆☆ (1 STAR)</option>
                  <option value="2">★★☆☆☆ (2 STARS)</option>
                  <option value="3">★★★☆☆ (3 STARS)</option>
                  <option value="4">★★★★☆ (4 STARS)</option>
                  <option value="5">★★★★★ (5 STARS)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                {data.cases.map((dossier) => (
                  <Link href={`/cases/${dossier.id}`} key={dossier.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <article
                      style={{ border: '2px solid var(--charcoal)', padding: '20px', backgroundColor: 'var(--paper)', cursor: 'crosshair', position: 'relative', transition: 'background-color 0.2s' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--paper-dark)';
                        const stamp = e.currentTarget.querySelector('.stamp-overlay') as HTMLElement;
                        if (stamp) stamp.style.opacity = '1';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'var(--paper)';
                        const stamp = e.currentTarget.querySelector('.stamp-overlay') as HTMLElement;
                        if (stamp) stamp.style.opacity = '0';
                      }}
                    >
                      <div className="stamp-overlay" style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.3s', zIndex: 10
                      }}>
                        <div style={{ border: '4px solid var(--red-bright)', color: 'var(--red-bright)', fontFamily: 'var(--font-mono)', fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', padding: '8px 16px', transform: 'rotate(-10deg)', backgroundColor: 'rgba(242,240,233,0.8)', backdropFilter: 'blur(2px)' }}>
                          OPEN CRIME SCENE
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px dashed var(--charcoal)', paddingBottom: '8px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', backgroundColor: 'var(--charcoal)', color: '#fff', padding: '2px 8px' }}>
                          FILE #{dossier.id.split('-')[0].toUpperCase()}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-light)' }}>
                          DATE: {dossier.date}
                        </div>
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', transition: 'color 0.2s' }}>
                        {dossier.title}
                      </h3>

                      <p style={{ fontSize: '14px', color: 'var(--ink-light)', marginBottom: '16px', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                        {dossier.description}
                      </p>

                      <div style={{ display: 'flex', gap: '24px', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--charcoal)', backgroundColor: 'var(--paper-yellow)', padding: '8px', border: '1px solid var(--charcoal)' }}>
                        <div><span style={{ color: 'var(--ink-light)' }}>DIFFICULTY:</span> {"★".repeat(dossier.difficulty)}{"☆".repeat(5 - dossier.difficulty)}</div>
                        <div><span style={{ color: 'var(--ink-light)' }}>SOLVE RATE:</span> {dossier.solve_rate}</div>
                        <div style={{ marginLeft: 'auto', color: 'var(--red-bright)' }}><span style={{ color: 'var(--ink-light)' }}>REWARD:</span> +{dossier.reward} FAME</div>
                      </div>
                    </article>
                  </Link>
                ))}

                {data.cases.length === 0 && (
                  <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', padding: '40px 0', color: 'var(--ink-light)', fontStyle: 'italic' }}>
                    [ NO ACTIVE CASES IN THE ARCHIVE ]
                  </div>
                )}

                {/* Pagination */}
                {data.pagination && data.pagination.last_page > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px dashed var(--charcoal)', paddingTop: '16px' }}>
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '6px 16px', border: '1px solid var(--charcoal)', backgroundColor: page === 1 ? 'transparent' : 'var(--charcoal)', color: page === 1 ? 'var(--charcoal)' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.3 : 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      ← PREV
                    </button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 'bold' }}>
                      PAGE {data.pagination.current_page} OF {data.pagination.last_page}
                    </span>
                    <button
                      disabled={page === data.pagination.last_page}
                      onClick={() => setPage(page + 1)}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '6px 16px', border: '1px solid var(--charcoal)', backgroundColor: page === data.pagination.last_page ? 'transparent' : 'var(--charcoal)', color: page === data.pagination.last_page ? 'var(--charcoal)' : '#fff', cursor: page === data.pagination.last_page ? 'not-allowed' : 'pointer', opacity: page === data.pagination.last_page ? 0.3 : 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      NEXT →
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Right Column */}
            <aside style={{ padding: '24px' }}>

              {/* Quote Block */}
              <div style={{ border: '1px dashed var(--charcoal)', padding: '16px', marginBottom: '32px', backgroundColor: 'var(--paper-dark)', position: 'relative' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '13px', lineHeight: 1.6, color: 'rgba(26,26,26,0.8)', textAlign: 'center', fontWeight: 'bold' }}>
                  "Justice is blind, but a good detective sees everything."
                </p>
                <div style={{ textAlign: 'right', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(26,26,26,0.6)' }}>
                  — Commissioner
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                <button
                  onClick={() => handleIdentityChange('DETECTIVE', '/agency')}
                  style={{ backgroundColor: 'var(--charcoal)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px', cursor: 'pointer', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px' }}>🔎</span> ENTER THE AGENCY
                </button>
                <button
                  onClick={() => handleIdentityChange('CRIMINAL', '/planner')}
                  style={{ backgroundColor: 'var(--paper-dark)', color: 'var(--charcoal)', border: '1px solid var(--charcoal)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px' }}>🎭</span> BECOME A CRIMINAL
                </button>
              </div>

              {/* Daily Bulletin / News */}
              <section>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--charcoal)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--red-bright)' }}>▶</span> DAILY BULLETIN
                </h2>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 'bold', fontSize: '16px', lineHeight: 1.2, marginBottom: '8px' }}>The Silent Witness</h3>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'rgba(26,26,26,0.7)' }}>
                    <div>Difficulty: <span style={{ color: 'var(--charcoal)', fontWeight: 'bold' }}>★★★★☆</span></div>
                    <div>Reward: <span style={{ color: 'var(--red-bright)', fontWeight: 'bold' }}>+500 FAME</span></div>
                    <div style={{ color: 'var(--red-bright)' }}>Expires in 14h 22m</div>
                  </div>
                </div>

                <div style={{ width: '100%', height: '1px', borderTop: '1px dashed rgba(26,26,26,0.5)', marginBottom: '24px' }} />

                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'rgba(26,26,26,0.6)' }}>⚡</span> BREAKING NEWS
                </h2>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <li>
                    <span style={{ fontWeight: 'bold' }}>SherlockNet</span> solved "The Vanishing Surgeon" — streak now at 24!
                    <div style={{ color: 'rgba(26,26,26,0.5)', marginTop: '4px' }}>1h ago</div>
                  </li>
                  <li>
                    New case published by <span style={{ fontWeight: 'bold' }}>Mastermind_X</span> — rated 5 stars difficulty.
                    <div style={{ color: 'rgba(26,26,26,0.5)', marginTop: '4px' }}>3h ago</div>
                  </li>
                </ul>
              </section>

            </aside>

          </div>
        </div>
      </main>
    </>
  );
}
