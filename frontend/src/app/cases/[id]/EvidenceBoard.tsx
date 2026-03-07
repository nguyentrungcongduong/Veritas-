'use client';

import { useInvestigationStore } from '@/store/investigationStore';
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EvidenceNode } from './EvidenceNode';
import { StatementNode } from './StatementNode';
import { useEffect } from 'react';

const nodeTypes = {
    evidence: EvidenceNode,
    statement: StatementNode,
};

/**
 * EvidenceBoard — Cột giữa: Bảng manh mối (Corkboard).
 * Dùng React Flow để nối dây tìm mâu thuẫn.
 */
export default function EvidenceBoard() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, syncNodes, clues, suspects } = useInvestigationStore();

    // Sync nodes when clues or suspects change (e.g. initial load)
    useEffect(() => {
        syncNodes();
    }, [clues.length, suspects.length, syncNodes]);

    return (
        <section style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Section label */}
            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#999', marginBottom: '10px', borderBottom: '1px dashed #999', paddingBottom: '6px',
            }}>
                ▌ EVIDENCE BOARD — BẢNG MANH MỐI
            </div>

            <div style={{
                flex: 1, backgroundColor: '#1a1a1a', position: 'relative', overflow: 'hidden', border: '2px solid #000'
            }}>
                {/* React Flow Board */}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    defaultEdgeOptions={{
                        type: 'step', // Đường nối vuông góc "noir"
                    }}
                >
                    <Background color="#333" variant={BackgroundVariant.Dots} />
                </ReactFlow>

                {/* Info label overlay */}
                <div style={{
                    position: 'absolute', bottom: '10px', right: '10px',
                    fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fff', opacity: 0.5,
                    letterSpacing: '0.1em', pointerEvents: 'none'
                }}>
                    [ DRAG FROM RED DOT TO LINK CONTRADICTIONS ]
                </div>
            </div>
        </section>
    );
}
