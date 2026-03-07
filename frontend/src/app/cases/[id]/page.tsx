'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/api';
import { useInvestigationStore } from '@/store/investigationStore';
import type { Suspect, Clue } from '@/store/investigationStore';
import CaseHeader from './CaseHeader';
import DossierPanel from './DossierPanel';
import EvidenceBoard from './EvidenceBoard';
import LogicDecoder from './LogicDecoder';
import VerdictBanner from './VerdictBanner';
import ScannerTooltip from './ScannerTooltip';
import CaseReportOverlay from './CaseReportOverlay';
import CrimeSceneLog from '@/components/CrimeSceneLog';
import VerdictAnimation from './VerdictAnimation';

interface CaseApiResponse {
    id: string;
    title: string;
    description: string;
    suspects: Suspect[];
    clues: Clue[];
    discovery: {
        hidden_clues: number;
        hidden_statements: number;
        total_clues: number;
        total_statements: number;
    };
}

export default function CasePage() {
    const params = useParams();
    const caseId = params.id as string;
    const { setCase, verdict } = useInvestigationStore();

    const { data, isLoading, error } = useQuery<CaseApiResponse>({
        queryKey: ['case', caseId],
        queryFn: () => api.get(`/v1/cases/${caseId}`).then((r) => r.data),
    });

    useEffect(() => {
        if (data) {
            setCase(data.title, data.suspects, data.clues, data.discovery);
        }
    }, [data, setCase]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontFamily: 'var(--font-mono)',
                color: 'var(--ink-light)', letterSpacing: '0.15em',
            }}>
                LOADING CASE FILE . . .
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontFamily: 'var(--font-mono)', color: 'var(--red)',
            }}>
                [ ERROR ] CASE FILE NOT FOUND
            </div>
        );
    }

    return (
        <main style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '24px 20px 60px',
        }}>
            <CaseHeader caseId={caseId} title={data.title} description={data.description} />

            {verdict && <VerdictBanner />}
            <ScannerTooltip />
            <CaseReportOverlay />

            <div style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr 320px',
                gap: '20px',
                marginTop: '24px',
            }}>
                {/* Trái: Dossier — Hồ sơ nghi phạm */}
                <DossierPanel />

                {/* Giữa: Evidence Board — Bảng manh mối */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Discovery Status Banner */}
                    <div style={{
                        border: '1px dashed #555',
                        background: '#1a1a1a',
                        color: '#f2f0e9',
                        padding: '8px 12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span>[ SYSTEM SCAN ] Bôi đen (highlight) những từ đáng ngờ để tìm kiếm sâu hơn.</span>
                        <div style={{ color: '#c41e1e', fontWeight: 'bold' }}>
                            REDACTED: {data.discovery.hidden_clues} CLUE(S) / {data.discovery.hidden_statements} STMT(S)
                        </div>
                    </div>

                    <EvidenceBoard />
                </div>

                {/* Phải: Logic Decoder — Kết nối + Kết tội */}
                <LogicDecoder caseId={caseId} />
            </div>

            {/* The Post-Mortem Discussing Room */}
            <CrimeSceneLog caseId={caseId} />
        </main>
    );
}
