import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';

// ── Types ────────────────────────────────────────────────────────────
export interface Statement {
    id: number;
    content: string;
}

export interface Suspect {
    id: string;
    name: string;
    bio: string;
    statements: Statement[];
}

export interface Clue {
    id: number;
    name: string;
    description: string;
    type: string;
}

export interface EvidencePair {
    clueId: number;
    clueName: string;
    statementId: number;
    statementContent: string;
}

export interface Verdict {
    verdict: 'CASE_SOLVED' | 'INSUFFICIENT_EVIDENCE' | 'WRONG_SUSPECT' | 'NO_EVIDENCE' | 'OUT_OF_ATTEMPTS' | 'ALREADY_SOLVED' | string;
    status?: string;
    message: string;
    attempts_left?: number;
    fame_earned?: number;
    penalty?: number;
    new_total_fame?: number;
    hint?: string;
    details?: {
        culprit?: string;
        valid_pairs?: { clue: string; statement: string; explanation: string }[];
        score?: number;
    };
}

// ── Store ────────────────────────────────────────────────────────────
interface InvestigationState {
    // Data từ API
    suspects: Suspect[];
    clues: Clue[];
    caseTitle: string;
    discoveryInfo: {
        hidden_clues: number;
        hidden_statements: number;
        total_clues: number;
        total_statements: number;
    } | null;

    // UI state
    activeSuspectId: string | null;   // Suspect đang xem statements
    accusedSuspectId: string | null;  // Suspect chọn để kết tội
    crossedOutSuspectIds: string[];   // Suspects bị gạch bỏ

    // Selected items chờ link
    pendingClueId: number | null;
    pendingStatementId: number | null;

    // Cặp bằng chứng đã xác nhận
    evidencePairs: EvidencePair[];

    // React Flow states
    nodes: Node[];
    edges: Edge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    syncNodes: () => void;

    // Penalty
    attemptsLeft: number;

    // Verdict từ API
    verdict: Verdict | null;
    isAccusing: boolean;

    // Actions
    setCase: (title: string, suspects: Suspect[], clues: Clue[], discoveryInfo?: InvestigationState['discoveryInfo']) => void;
    setActiveSuspect: (id: string) => void;
    setAccusedSuspect: (id: string) => void;
    toggleCrossOutSuspect: (id: string) => void;
    selectClue: (id: number) => void;
    selectStatement: (id: number) => void;
    linkEvidencePair: () => void;       // Link pending clue + statement → cặp
    removePair: (index: number) => void;
    resetPending: () => void;
    setVerdict: (v: Verdict | null) => void;
    setAccusing: (v: boolean) => void;
    addUnlockedData: (newClues: Clue[], newStatements: { suspectId: string, statement: Statement }[]) => void;
    reset: () => void;
}

const defaultState = {
    suspects: [],
    clues: [],
    caseTitle: '',
    discoveryInfo: null,
    activeSuspectId: null,
    accusedSuspectId: null,
    crossedOutSuspectIds: [],
    pendingClueId: null,
    pendingStatementId: null,
    evidencePairs: [],
    attemptsLeft: 3,
    verdict: null,
    isAccusing: false,
    nodes: [],
    edges: [],
};

export const useInvestigationStore = create<InvestigationState>((set, get) => ({
    ...defaultState,

    setCase: (title, suspects, clues, discoveryInfo = null) => {
        set({ caseTitle: title, suspects, clues, discoveryInfo });
        get().syncNodes();
    },

    setActiveSuspect: (id) =>
        set({ activeSuspectId: id }),

    setAccusedSuspect: (id) =>
        set({ accusedSuspectId: id }),

    toggleCrossOutSuspect: (id) => set((s) => {
        const isCrossed = s.crossedOutSuspectIds.includes(id);
        const newCrossed = isCrossed
            ? s.crossedOutSuspectIds.filter(x => x !== id)
            : [...s.crossedOutSuspectIds, id];

        // Nếu đang accused mà trót gạch bỏ, bỏ accuse luôn
        let newAccused = s.accusedSuspectId;
        if (!isCrossed && newAccused === id) {
            newAccused = null;
        }
        return { crossedOutSuspectIds: newCrossed, accusedSuspectId: newAccused };
    }),

    selectClue: (id) => set((s) => {
        // Toggle: click lại thì bỏ chọn
        const clueId = s.pendingClueId === id ? null : id;
        return { pendingClueId: clueId };
    }),

    selectStatement: (id) => set((s) => {
        const statementId = s.pendingStatementId === id ? null : id;
        return { pendingStatementId: statementId };
    }),

    linkEvidencePair: () => {
        const { pendingClueId, pendingStatementId, suspects, clues, evidencePairs } = get();
        if (!pendingClueId || !pendingStatementId) return;

        // Tìm tên để hiển thị
        const clue = clues.find((c) => c.id === pendingClueId);
        const statement = suspects
            .flatMap((s) => s.statements)
            .find((st) => st.id === pendingStatementId);

        if (!clue || !statement) return;

        // Tránh trùng lặp
        const alreadyExists = evidencePairs.some(
            (p) => p.clueId === pendingClueId && p.statementId === pendingStatementId
        );
        if (alreadyExists) return;

        set({
            evidencePairs: [
                ...evidencePairs,
                {
                    clueId: pendingClueId,
                    clueName: clue.name,
                    statementId: pendingStatementId,
                    statementContent: statement.content,
                },
            ],
            pendingClueId: null,
            pendingStatementId: null,
        });
    },

    removePair: (index) => set((s) => {
        const pairToRemove = s.evidencePairs[index];
        if (!pairToRemove) return {};

        const newPairs = s.evidencePairs.filter((_, i) => i !== index);

        // Remove corresponding edge
        const newEdges = s.edges.filter(e => {
            const isMatch1 = e.source === `clue-${pairToRemove.clueId}` && e.target === `stmt-${pairToRemove.statementId}`;
            const isMatch2 = e.target === `clue-${pairToRemove.clueId}` && e.source === `stmt-${pairToRemove.statementId}`;
            return !(isMatch1 || isMatch2);
        });

        return { evidencePairs: newPairs, edges: newEdges };
    }),

    resetPending: () =>
        set({ pendingClueId: null, pendingStatementId: null }),

    setVerdict: (verdict) => set((s) => ({
        verdict,
        attemptsLeft: verdict?.attempts_left ?? s.attemptsLeft,
    })),

    setAccusing: (isAccusing) => set({ isAccusing }),

    addUnlockedData: (newClues, newStatements) => set((s) => {
        const clues = [...s.clues];
        newClues.forEach(nc => {
            if (!clues.find(c => c.id === nc.id)) clues.push(nc);
        });

        const suspects = [...s.suspects];
        newStatements.forEach(ns => {
            const suspect = suspects.find(su => su.id === ns.suspectId);
            if (suspect) {
                if (!suspect.statements.find(st => st.id === ns.statement.id)) {
                    suspect.statements.push(ns.statement);
                }
            }
        });

        // Use a setTimeout or call syncNodes directly, wait, we are inside a set updater function!
        // We can't call get().syncNodes() inside `set((s) => ...)` easily while returning new state, 
        // because it depends on the updated clues. 
        // We should just return clues/suspects, and do syncNodes slightly differently.
        // Actually, let's just do an async call.
        setTimeout(() => get().syncNodes(), 0);

        return { clues, suspects };
    }),

    onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
    onEdgesChange: (changes) => set((s) => {
        const removedEdges = changes.filter(c => c.type === 'remove') as any[];

        // Remove from evidencePairs
        let newPairs = [...s.evidencePairs];
        removedEdges.forEach(re => {
            const edge = s.edges.find(e => e.id === re.id);
            if (edge) {
                let clueId: number | null = null;
                let statementId: number | null = null;
                if (edge.source.startsWith('clue-')) {
                    clueId = parseInt(edge.source.replace('clue-', ''), 10);
                    statementId = parseInt(edge.target.replace('stmt-', ''), 10);
                } else {
                    clueId = parseInt(edge.target.replace('clue-', ''), 10);
                    statementId = parseInt(edge.source.replace('stmt-', ''), 10);
                }
                newPairs = newPairs.filter(p => !(p.clueId === clueId && p.statementId === statementId));
            }
        });

        return {
            edges: applyEdgeChanges(changes, s.edges),
            evidencePairs: newPairs
        };
    }),

    onConnect: (connection) => {
        let clueId: number | null = null;
        let statementId: number | null = null;

        if (connection.source.startsWith('clue-') && connection.target.startsWith('stmt-')) {
            clueId = parseInt(connection.source.replace('clue-', ''), 10);
            statementId = parseInt(connection.target.replace('stmt-', ''), 10);
        } else if (connection.target.startsWith('clue-') && connection.source.startsWith('stmt-')) {
            clueId = parseInt(connection.target.replace('clue-', ''), 10);
            statementId = parseInt(connection.source.replace('stmt-', ''), 10);
        }

        const newEdge = {
            ...connection,
            style: { stroke: '#b91c1c', strokeWidth: 3, strokeDasharray: '5,5' },
            animated: true
        };

        set((s) => {
            const newEdges = addEdge(newEdge, s.edges);
            let newPairs = [...s.evidencePairs];

            if (clueId && statementId) {
                const clue = s.clues.find(c => c.id === clueId);
                const statement = s.suspects.flatMap(su => su.statements).find(st => st.id === statementId);

                if (clue && statement) {
                    const exists = newPairs.some(p => p.clueId === clueId && p.statementId === statementId);
                    if (!exists) {
                        newPairs.push({
                            clueId,
                            clueName: clue.name,
                            statementId,
                            statementContent: statement.content
                        });

                        // Optional: play a drop sound
                        try {
                            const audio = new Audio('/pin-drop.mp3');
                            audio.volume = 0.5;
                            audio.play().catch(() => { });
                        } catch (e) { }
                    }
                }
            }

            return { edges: newEdges, evidencePairs: newPairs };
        });
    },

    syncNodes: () => {
        const { clues, suspects, nodes } = get();
        const newNodes = [...nodes];

        let clueCount = newNodes.filter(n => n.type === 'evidence').length;
        let stmtCount = newNodes.filter(n => n.type === 'statement').length;

        clues.forEach((c) => {
            if (!newNodes.find(n => n.id === `clue-${c.id}`)) {
                newNodes.push({
                    id: `clue-${c.id}`,
                    type: 'evidence',
                    position: { x: 50 + (Math.random() * 50 - 25), y: 50 + clueCount * 180 },
                    data: { id: c.id, title: c.name, description: c.description }
                });
                clueCount++;
            }
        });

        suspects.forEach((su) => {
            su.statements.forEach((st) => {
                if (!newNodes.find(n => n.id === `stmt-${st.id}`)) {
                    newNodes.push({
                        id: `stmt-${st.id}`,
                        type: 'statement',
                        position: { x: 350 + (Math.random() * 50 - 25), y: 50 + stmtCount * 120 },
                        data: { id: st.id, suspectName: su.name, content: st.content }
                    });
                    stmtCount++;
                }
            });
        });

        set({ nodes: newNodes });
    },

    reset: () => set(defaultState),
}));

