'use client';

import NotificationBell from "@/components/NotificationBell";

/**
 * CaseHeader — Stamp-style case file header.
 * Trông như bìa hồ sơ cảnh sát: con dấu, số vụ án, TOP SECRET.
 */
export default function CaseHeader({
    caseId,
    title,
    description,
}: {
    caseId: string;
    title: string;
    description: string;
}) {
    const shortId = caseId.slice(0, 8).toUpperCase();

    return (
        <header style={{
            border: '2px solid #1a1a1a',
            padding: '0',
            position: 'relative',
            background: '#f2f0e9',
        }}>
            {/* Top bar — stamp */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#1a1a1a',
                color: '#f2f0e9',
                padding: '8px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
            }}>
                <span>CASE FILE #{shortId}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{
                        border: '1px solid #c41e1e',
                        color: '#c41e1e',
                        padding: '2px 10px',
                        fontWeight: 700,
                    }}>
                        CLASSIFIED
                    </span>
                    <NotificationBell />
                </div>
                <span>VERITAS DEPT.</span>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 24px' }}>
                <h1 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 8px',
                    lineHeight: 1.3,
                    borderBottom: '2px solid #1a1a1a',
                    paddingBottom: '10px',
                }}>
                    {title}
                </h1>
                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    color: '#555',
                    lineHeight: 1.6,
                    maxWidth: '700px',
                }}>
                    {description}
                </p>
            </div>

            {/* Corner stamp decoration */}
            <div style={{
                position: 'absolute',
                top: '50px',
                right: '24px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: '#999',
                textAlign: 'right',
                lineHeight: 1.6,
            }}>
                <div>DATE: {new Date().toLocaleDateString('vi-VN')}</div>
                <div>STATUS: UNDER INVESTIGATION</div>
            </div>
        </header>
    );
}
