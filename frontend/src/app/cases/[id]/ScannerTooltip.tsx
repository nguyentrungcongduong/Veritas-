'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useInvestigationStore } from '@/store/investigationStore';
import { useParams } from 'next/navigation';

export default function ScannerTooltip() {
    const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    const params = useParams();
    const caseId = params.id as string;
    const { addUnlockedData, discoveryInfo, setCase, suspects, clues, caseTitle } = useInvestigationStore();

    useEffect(() => {
        const handleMouseUp = (e: MouseEvent) => {
            // Don't trigger if clicking inside the tooltip itself
            if ((e.target as HTMLElement).closest('#scanner-tooltip')) return;

            const sel = window.getSelection();
            if (sel && sel.toString().trim().length > 0) {
                const text = sel.toString().trim();
                // Limit word count to prevent scanning whole paragraphs
                if (text.split(/\s+/).length > 5) {
                    setSelection(null);
                    return;
                }

                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setSelection({
                    text,
                    x: rect.left + rect.width / 2,
                    y: rect.top + window.scrollY - 10, // slightly above
                });
                setScanResult(null);
            } else {
                setSelection(null);
                setScanResult(null);
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const handleScan = async () => {
        if (!selection || !caseId) return;

        setIsScanning(true);
        setScanResult(null);
        try {
            const res = await api.post(`/v1/investigations/${caseId}/unlock`, {
                keyword: selection.text,
            });

            const { newly_unlocked, message } = res.data;

            if (newly_unlocked && newly_unlocked.length > 0) {
                setScanResult({ type: 'success', message: `+${newly_unlocked.length} MANH MỐI MỚI` });

                // Cần fetch lại toàn bộ case data để có full structure
                // Hoặc cập nhật store bằng addUnlockedData. Fetch lại cho chắc:
                const caseRes = await api.get(`/v1/cases/${caseId}`);
                setCase(caseRes.data.title, caseRes.data.suspects, caseRes.data.clues, caseRes.data.discovery);
            } else {
                setScanResult({ type: 'info', message: 'KHÔNG TÌM THẤY MANH MỐI' });
            }

            // Auto close after 2s
            setTimeout(() => {
                setSelection(null);
                setScanResult(null);
                window.getSelection()?.removeAllRanges();
            }, 2000);

        } catch (err) {
            setScanResult({ type: 'error', message: 'ERROR SCANNING' });
        } finally {
            setIsScanning(false);
        }
    };

    if (!selection) return null;

    return (
        <div
            id="scanner-tooltip"
            style={{
                position: 'absolute',
                top: selection.y,
                left: selection.x,
                transform: 'translate(-50%, -100%)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
            }}
        >
            <button
                onClick={handleScan}
                disabled={isScanning || scanResult !== null}
                style={{
                    background: '#1a1a1a',
                    color: '#f2f0e9',
                    border: '2px solid #f2f0e9',
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    cursor: isScanning || scanResult ? 'default' : 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}
            >
                {isScanning ? 'SCANNING...' : scanResult ? scanResult.message : `SCAN: "${selection.text}"`}
            </button>

            {/* Little pointer triangle */}
            <div style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1a1a1a',
            }} />
        </div>
    );
}
