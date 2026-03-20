'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DrawerProps {
    label: string;
    sublabel: string;
    color: string;
    isActive?: boolean;
    onClick: () => void;
}

function Drawer({ label, sublabel, color, isActive, onClick }: DrawerProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: '100%',
                height: '100px',
                backgroundColor: isHovered ? color : 'var(--paper-dark)',
                border: '2px solid var(--charcoal)',
                borderBottomWidth: '6px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'none',
                position: 'relative',
                boxShadow: isHovered ? `0 10px 20px -5px ${color}44` : 'none',
                overflow: 'hidden'
            }}
        >
            {/* Handle */}
            <div style={{
                position: 'absolute',
                left: '50%',
                bottom: '12px',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '8px',
                backgroundColor: 'var(--charcoal)',
                borderRadius: '4px',
                opacity: 0.8
            }} />

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '18px',
                    fontWeight: '900',
                    color: isHovered ? '#fff' : 'var(--charcoal)',
                    letterSpacing: '0.1em'
                }}>
                    {label}
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: isHovered ? '#fff' : 'var(--ink-light)',
                    opacity: 0.7,
                    marginTop: '2px',
                    textTransform: 'uppercase'
                }}>
                    {sublabel}
                </div>
            </div>

            {/* Badge/Sticker */}
            <div style={{
                border: `1px dashed ${isHovered ? '#fff' : 'var(--charcoal)'}`,
                padding: '4px 8px',
                fontSize: '10px',
                color: isHovered ? '#fff' : 'var(--charcoal)',
                fontFamily: 'var(--font-mono)',
                transform: 'rotate(5deg)'
            }}>
                {isActive ? '● OPEN' : '○ CLOSED'}
            </div>
        </div>
    );
}

export default function ModeSelectionCabinet() {
    const router = useRouter();

    const handleSelect = (mode: string) => {
        switch (mode) {
            case 'academy':
                router.push('/academy');
                break;
            case 'active':
                router.push('/agency');
                break;
            case 'ranked':
                router.push('/red-file');
                break;
            default:
                router.push('/agency');
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#333',
            padding: '20px',
            border: '8px solid var(--charcoal)',
            borderRadius: '4px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
            <div style={{
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                marginBottom: '10px',
                paddingLeft: '4px',
                borderLeft: '4px solid var(--red)'
            }}>
                PROPERTY OF VERITAS - CLASSIFIED DOSSIERS
            </div>

            <Drawer
                label="[ ACADEMY ]"
                sublabel="POLICE_ACADEMY_ROOKIE_HINTS"
                color="#2d4a5a" // Steel Blue
                isActive
                onClick={() => handleSelect('academy')}
            />

            <Drawer
                label="[ ACTIVE CASES ]"
                sublabel="THE_DOSSIER_FEED_SOCIAL"
                color="#b8860b" // Dark Yellow/Gold
                isActive
                onClick={() => handleSelect('active')}
            />

            <Drawer
                label="[ THE RED FILE ]"
                sublabel="HARDCORE_RANKED_DO_NOT_OPEN"
                color="#8b1a1a" // Blood Red
                isActive
                onClick={() => handleSelect('ranked')}
            />
        </div>
    );
}
