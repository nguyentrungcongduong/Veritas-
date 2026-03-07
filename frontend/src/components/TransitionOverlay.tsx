'use client';

import { useUserStore } from '@/store/useUserStore';

interface TransitionOverlayProps {
    isTransitioning: boolean;
}

export default function TransitionOverlay({ isTransitioning }: TransitionOverlayProps) {
    const { activeRole } = useUserStore();

    if (!isTransitioning) return null;

    const isCriminal = activeRole === 'CRIMINAL';

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isCriminal ? '#000' : 'var(--paper)',
            backgroundImage: isCriminal ? 'none' : 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")'
        }}>
            <h2 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                color: isCriminal ? 'var(--red-bright)' : 'var(--charcoal)',
                animation: 'overlay-pulse 1s infinite'
            }}>
                {activeRole === 'DETECTIVE' ? "ACCESSING POLICE RECORDS..." : "ENCRYPTING CONNECTION..."}
            </h2>
            <style>{`
        @keyframes overlay-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
        </div>
    );
}
