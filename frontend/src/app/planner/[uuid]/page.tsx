'use client';

import {
    useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ReactFlow, Background, BackgroundVariant, Controls, MiniMap,
    addEdge, applyEdgeChanges, applyNodeChanges,
    useReactFlow, ReactFlowProvider,
    type NodeTypes, type Node, type Edge, type Connection,
    type NodeChange, type EdgeChange,
    Handle, Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import api from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Suspect { id: string; name: string; bio: string; is_culprit: boolean; statements: Statement[]; }
interface Statement { id: number; content: string; type: 'truth' | 'lie'; discovery_tier: number; trigger_keyword: string | null; }
interface Clue { id: number; name: string; description: string; type: string; discovery_tier: number; trigger_keyword: string | null; }
interface CaseData {
    id: string; title: string; description: string;
    difficulty: number; reward_fame: number; status: string;
    suspects: Suspect[]; clues: Clue[];
    blueprint_data: any; correct_suspect_id: string | null;
    is_solved_by_creator: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM NODES — In-place editable / blueprint style
// ─────────────────────────────────────────────────────────────────────────────
const PlannerSuspectNode = ({ data, selected }: any) => {
    const [name, setName] = useState(data.label ?? '');
    const [bio, setBio] = useState(data.bio ?? '');
    const [isCulprit, setCulprit] = useState(data.is_culprit ?? false);
    const idRef = useRef(`SUS-${String(data.dbId || '???').slice(-4).toUpperCase()}`);

    return (
        <div
            className={isCulprit ? 'culprit-glow' : ''}
            style={{
                background: isCulprit ? 'rgba(80,0,0,0.6)' : 'rgba(5,5,5,0.92)',
                border: `2px solid ${isCulprit ? '#ff2020' : 'rgba(255,32,32,0.35)'}`,
                width: 210,
                boxShadow: selected ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none',
                position: 'relative',
            }}
        >
            <Handle type="target" position={Position.Left} id="tgt" style={{ background: '#ff2020', width: 10, height: 10, borderRadius: 0, border: 'none', left: -5 }} />
            <Handle type="source" position={Position.Right} id="src" style={{ background: '#ff2020', width: 10, height: 10, borderRadius: 0, border: 'none', right: -5 }} />

            {/* Header bar */}
            <div style={{ background: isCulprit ? 'rgba(255,32,32,0.2)' : 'rgba(255,32,32,0.08)', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,32,32,0.2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ff2020', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    {idRef.current}
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 8, color: isCulprit ? '#ff6060' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <input type="checkbox" checked={isCulprit} onChange={e => setCulprit(e.target.checked)} style={{ accentColor: '#ff2020', width: 10, height: 10 }} />
                    CULPRIT
                </label>
            </div>

            {/* Editable name */}
            <div style={{ padding: '8px 10px 6px' }}>
                <input
                    className="blueprint-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="SUSPECT NAME..."
                    style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <textarea
                    className="blueprint-input"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Bio / Motive..."
                    rows={2}
                    style={{ marginTop: 6, resize: 'none', fontSize: 9, lineHeight: 1.5 }}
                />
            </div>

            {/* Bottom accent line */}
            <div style={{ height: 2, background: isCulprit ? 'linear-gradient(to right, #ff2020, transparent)' : 'linear-gradient(to right, rgba(255,32,32,0.3), transparent)' }} />
        </div>
    );
};

const PlannerStatementNode = ({ data, selected }: any) => {
    const [content, setContent] = useState(data.label ?? '');
    const isLie = data.type === 'lie';

    return (
        <div style={{
            background: 'rgba(5,5,5,0.92)',
            border: `1px solid ${isLie ? 'rgba(255,32,32,0.5)' : 'rgba(30,160,30,0.5)'}`,
            width: 200, minWidth: 200,
            boxShadow: selected ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none',
        }}>
            <Handle type="target" position={Position.Left} id="tgt" style={{ background: isLie ? '#ff2020' : '#20c020', width: 10, height: 10, borderRadius: 0, border: 'none', left: -5 }} />
            <Handle type="source" position={Position.Right} id="src" style={{ background: isLie ? '#ff2020' : '#20c020', width: 10, height: 10, borderRadius: 0, border: 'none', right: -5 }} />

            <div style={{ padding: '5px 10px', background: isLie ? 'rgba(255,32,32,0.1)' : 'rgba(30,160,30,0.1)', borderBottom: `1px solid ${isLie ? 'rgba(255,32,32,0.2)' : 'rgba(30,160,30,0.2)'}`, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: isLie ? '#ff6060' : '#50e050', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    {isLie ? '⚠ LIE' : '✓ TRUTH'}
                </span>
                {data.discovery_tier > 0 && (
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>T{data.discovery_tier}</span>
                )}
            </div>

            <div style={{ padding: '8px 10px' }}>
                <textarea
                    className="blueprint-input"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`"${isLie ? 'I was at home...' : 'The truth is...'}"`}
                    rows={3}
                    style={{ resize: 'none', fontSize: 10, fontStyle: 'italic', lineHeight: 1.5 }}
                />
            </div>
            <div style={{ height: 1, background: isLie ? 'linear-gradient(to right, rgba(255,32,32,0.3), transparent)' : 'linear-gradient(to right, rgba(30,160,30,0.3), transparent)' }} />
        </div>
    );
};

const PlannerClueNode = ({ data, selected }: any) => {
    const [name, setName] = useState(data.label ?? '');
    const [desc, setDesc] = useState(data.description ?? '');
    const typeColors: Record<string, string> = { physical: '#b47800', digital: '#0078b4', testimony: '#6a0ab4' };
    const tc = typeColors[data.clueType?.toLowerCase() ?? 'physical'] ?? '#b47800';

    return (
        <div style={{
            background: 'rgba(5,5,5,0.92)',
            border: `1px solid ${tc}55`,
            width: 200,
            boxShadow: selected ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none',
        }}>
            <Handle type="target" position={Position.Left} id="tgt" style={{ background: tc, width: 10, height: 10, borderRadius: 0, border: 'none', left: -5 }} />
            <Handle type="source" position={Position.Right} id="src" style={{ background: tc, width: 10, height: 10, borderRadius: 0, border: 'none', right: -5 }} />

            <div style={{ padding: '5px 10px', background: `${tc}18`, borderBottom: `1px solid ${tc}33`, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: tc, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    📁 {data.clueType ?? 'CLUE'}
                </span>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>T{data.discovery_tier ?? 0}</span>
            </div>

            <div style={{ padding: '8px 10px' }}>
                <input
                    className="blueprint-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="CLUE NAME..."
                    style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <textarea
                    className="blueprint-input"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Description..."
                    rows={2}
                    style={{ marginTop: 5, resize: 'none', fontSize: 9, lineHeight: 1.5 }}
                />
            </div>
            <div style={{ height: 1, background: `linear-gradient(to right, ${tc}60, transparent)` }} />
        </div>
    );
};

const nodeTypes: NodeTypes = {
    suspect: PlannerSuspectNode as any,
    statement: PlannerStatementNode as any,
    clue: PlannerClueNode as any,
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — Asset Library with Drag & Drop source
// ─────────────────────────────────────────────────────────────────────────────
function AssetLibrary({ caseData, onRefresh }: { caseData: CaseData; onRefresh: () => void }) {
    const [activeForm, setActiveForm] = useState<'suspect' | 'clue' | 'statement' | null>(null);
    const [suspectForm, setSuspectForm] = useState({ name: '', bio: '', is_culprit: false });
    const [clueForm, setClueForm] = useState({ name: '', description: '', type: 'physical', discovery_tier: 0, trigger_keyword: '' });
    const [stmtForm, setStmtForm] = useState({ suspect_id: '', content: '', type: 'lie' as 'truth' | 'lie', discovery_tier: 0, trigger_keyword: '' });
    const [loading, setLoading] = useState(false);

    const onDragStart = (e: React.DragEvent, nodeType: string, extraData?: object) => {
        e.dataTransfer.setData('application/reactflow-type', nodeType);
        if (extraData) e.dataTransfer.setData('application/reactflow-data', JSON.stringify(extraData));
        e.dataTransfer.effectAllowed = 'move';
    };

    const addSuspect = async () => {
        if (!suspectForm.name.trim()) return;
        setLoading(true);
        try {
            await api.post(`/v1/planner/${caseData.id}/suspects`, suspectForm);
            setSuspectForm({ name: '', bio: '', is_culprit: false });
            onRefresh(); setActiveForm(null);
        } finally { setLoading(false); }
    };

    const addClue = async () => {
        if (!clueForm.name.trim()) return;
        setLoading(true);
        try {
            await api.post(`/v1/planner/${caseData.id}/clues`, clueForm);
            setClueForm({ name: '', description: '', type: 'physical', discovery_tier: 0, trigger_keyword: '' });
            onRefresh(); setActiveForm(null);
        } finally { setLoading(false); }
    };

    const addStatement = async () => {
        if (!stmtForm.content.trim() || !stmtForm.suspect_id) return;
        setLoading(true);
        try {
            await api.post(`/v1/planner/${caseData.id}/statements`, stmtForm);
            setStmtForm({ suspect_id: '', content: '', type: 'lie', discovery_tier: 0, trigger_keyword: '' });
            onRefresh(); setActiveForm(null);
        } finally { setLoading(false); }
    };

    const totalStatements = caseData.suspects.reduce((a, s) => a + s.statements.length, 0);
    const hasCulprit = caseData.suspects.some(s => s.is_culprit);

    return (
        <aside className="blueprint-scroll" style={{
            width: 240, flexShrink: 0,
            borderRight: '1px solid rgba(185,28,28,0.25)',
            background: '#080808',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
        }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(185,28,28,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, background: '#ff2020', borderRadius: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ff2020', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 'bold' }}>
                    Asset Library
                </span>
            </div>

            {/* Drag-to-canvas notice */}
            <div style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                ⟵ Drag onto canvas to place
            </div>

            {/* Draggable assets */}
            <div style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Suspects from DB */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>
                    Suspects ({caseData.suspects.length})
                </div>
                {caseData.suspects.map(s => (
                    <div
                        key={s.id}
                        className="asset-card"
                        draggable
                        onDragStart={e => onDragStart(e, 'suspect', { label: s.name, bio: s.bio, is_culprit: s.is_culprit, dbId: s.id })}
                        style={{ color: s.is_culprit ? '#ff6060' : 'rgba(255,255,255,0.6)', borderColor: s.is_culprit ? 'rgba(255,32,32,0.5)' : undefined }}
                    >
                        <span style={{ fontSize: 10 }}>{s.is_culprit ? '●' : '○'}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10 }}>{s.name}</span>
                    </div>
                ))}
                <button
                    onClick={() => setActiveForm(activeForm === 'suspect' ? null : 'suspect')}
                    style={{ background: 'none', border: '1px dashed rgba(255,32,32,0.25)', color: 'rgba(255,32,32,0.5)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '7px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,32,32,0.6)'; e.currentTarget.style.color = '#ff2020'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,32,32,0.25)'; e.currentTarget.style.color = 'rgba(255,32,32,0.5)'; }}
                >+ New Suspect</button>

                {activeForm === 'suspect' && (
                    <div style={{ background: 'rgba(255,32,32,0.04)', border: '1px solid rgba(255,32,32,0.15)', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input className="blueprint-input" placeholder="NAME..." value={suspectForm.name} onChange={e => setSuspectForm(f => ({ ...f, name: e.target.value }))} />
                        <textarea className="blueprint-input" placeholder="Bio..." rows={2} value={suspectForm.bio} onChange={e => setSuspectForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: 'none' }} />
                        <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 8, color: '#ff6060', textTransform: 'uppercase' }}>
                            <input type="checkbox" checked={suspectForm.is_culprit} onChange={e => setSuspectForm(f => ({ ...f, is_culprit: e.target.checked }))} style={{ accentColor: '#ff2020' }} />
                            Mark as Culprit
                        </label>
                        <button onClick={addSuspect} disabled={loading} style={{ background: '#ff2020', color: '#fff', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 'bold', padding: '6px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {loading ? '...' : 'Add'}
                        </button>
                    </div>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

                {/* Clues */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(180,120,0,0.6)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>
                    Clues ({caseData.clues.length})
                </div>
                {caseData.clues.map(c => (
                    <div
                        key={c.id}
                        className="asset-card"
                        draggable
                        onDragStart={e => onDragStart(e, 'clue', { label: c.name, description: c.description, clueType: c.type.toUpperCase(), discovery_tier: c.discovery_tier, dbId: c.id })}
                        style={{ color: 'rgba(180,120,0,0.8)', borderColor: 'rgba(180,120,0,0.3)' }}
                    >
                        <span style={{ fontSize: 9 }}>📁</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10 }}>{c.name}</span>
                    </div>
                ))}
                <button
                    onClick={() => setActiveForm(activeForm === 'clue' ? null : 'clue')}
                    style={{ background: 'none', border: '1px dashed rgba(180,120,0,0.25)', color: 'rgba(180,120,0,0.5)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '7px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180,120,0,0.6)'; e.currentTarget.style.color = 'rgb(180,120,0)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(180,120,0,0.25)'; e.currentTarget.style.color = 'rgba(180,120,0,0.5)'; }}
                >+ Plant Clue</button>

                {activeForm === 'clue' && (
                    <div style={{ background: 'rgba(180,120,0,0.04)', border: '1px solid rgba(180,120,0,0.2)', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input className="blueprint-input" placeholder="CLUE NAME..." value={clueForm.name} onChange={e => setClueForm(f => ({ ...f, name: e.target.value }))} />
                        <textarea className="blueprint-input" placeholder="What it reveals..." rows={2} value={clueForm.description} onChange={e => setClueForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'none' }} />
                        <select className="blueprint-input" value={clueForm.type} onChange={e => setClueForm(f => ({ ...f, type: e.target.value }))} style={{ appearance: 'none' }}>
                            <option value="physical">Physical</option>
                            <option value="digital">Digital</option>
                            <option value="testimony">Testimony</option>
                        </select>
                        <input className="blueprint-input" placeholder="Trigger keyword..." value={clueForm.trigger_keyword} onChange={e => setClueForm(f => ({ ...f, trigger_keyword: e.target.value }))} />
                        <button onClick={addClue} disabled={loading} style={{ background: 'rgba(180,120,0,0.6)', color: '#fff', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 'bold', padding: '6px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {loading ? '...' : 'Plant'}
                        </button>
                    </div>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

                {/* Statements */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(80,180,80,0.6)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>
                    Statements ({totalStatements})
                </div>
                {caseData.suspects.flatMap(s => s.statements.map(st => (
                    <div
                        key={st.id}
                        className="asset-card"
                        draggable
                        onDragStart={e => onDragStart(e, 'statement', { label: st.content, type: st.type, discovery_tier: st.discovery_tier, dbId: st.id })}
                        style={{ color: st.type === 'lie' ? 'rgba(255,80,80,0.8)' : 'rgba(80,200,80,0.8)', borderColor: st.type === 'lie' ? 'rgba(255,32,32,0.3)' : 'rgba(30,160,30,0.3)', fontSize: 9 }}
                    >
                        <span>{st.type === 'lie' ? '⚠' : '✓'}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>"{st.content.slice(0, 28)}..."</span>
                    </div>
                )))}
                <button
                    onClick={() => setActiveForm(activeForm === 'statement' ? null : 'statement')}
                    style={{ background: 'none', border: '1px dashed rgba(80,160,80,0.25)', color: 'rgba(80,160,80,0.5)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '7px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(80,160,80,0.6)'; e.currentTarget.style.color = 'rgb(80,200,80)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(80,160,80,0.25)'; e.currentTarget.style.color = 'rgba(80,160,80,0.5)'; }}
                >+ Write Statement</button>

                {activeForm === 'statement' && (
                    <div style={{ background: 'rgba(30,160,30,0.04)', border: '1px solid rgba(30,160,30,0.2)', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <select className="blueprint-input" value={stmtForm.suspect_id} onChange={e => setStmtForm(f => ({ ...f, suspect_id: e.target.value }))} style={{ appearance: 'none' }}>
                            <option value="">— Suspect —</option>
                            {caseData.suspects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <textarea className="blueprint-input" placeholder='"I was at home all night..."' rows={3} value={stmtForm.content} onChange={e => setStmtForm(f => ({ ...f, content: e.target.value }))} style={{ resize: 'none', fontStyle: 'italic' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                            {(['lie', 'truth'] as const).map(t => (
                                <button key={t} onClick={() => setStmtForm(f => ({ ...f, type: t }))} style={{ flex: 1, padding: '4px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', background: stmtForm.type === t ? (t === 'lie' ? '#ff2020' : '#20a020') : 'rgba(255,255,255,0.05)', color: stmtForm.type === t ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                                    {t === 'lie' ? '⚠ Lie' : '✓ Truth'}
                                </button>
                            ))}
                        </div>
                        <button onClick={addStatement} disabled={loading} style={{ background: 'rgba(30,160,30,0.6)', color: '#fff', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 'bold', padding: '6px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {loading ? '...' : 'Write'}
                        </button>
                    </div>
                )}
            </div>

            {/* Logic Integrity */}
            <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(185,28,28,0.15)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 8 }}>
                    Logic Integrity
                </div>
                {[
                    { label: 'Suspects ≥ 2', ok: caseData.suspects.length >= 2 },
                    { label: 'Culprit set', ok: hasCulprit },
                    { label: 'Clues ≥ 2', ok: caseData.clues.length >= 2 },
                    { label: 'Statements exist', ok: totalStatements > 0 },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: item.ok ? 'rgba(80,200,80,0.8)' : 'rgba(255,255,255,0.25)' }}>
                        <span style={{ fontSize: 8, width: 12 }}>{item.ok ? '✓' : '○'}</span>
                        {item.label}
                    </div>
                ))}
            </div>
        </aside>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTIES PANEL — Right sidebar, shows selected node details
// ─────────────────────────────────────────────────────────────────────────────
function PropertiesPanel({ selectedNode }: { selectedNode: Node | null }) {
    if (!selectedNode) {
        return (
            <aside style={{ width: 240, flexShrink: 0, borderLeft: '1px solid rgba(185,28,28,0.25)', background: '#080808', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(185,28,28,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, background: 'rgba(185,28,28,0.4)', borderRadius: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 'bold' }}>Node Properties</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '24px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, opacity: 0.15 }}>⊹</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', lineHeight: 1.8 }}>
                        Select a node on the canvas to inspect
                    </div>
                </div>
            </aside>
        );
    }

    const { data, type, id } = selectedNode;
    const typeLabels: Record<string, string> = { suspect: 'SUSPECT', statement: 'STATEMENT', clue: 'CLUE' };
    const typeColors: Record<string, string> = { suspect: '#ff2020', statement: data.type === 'lie' ? '#ff6060' : '#50e050', clue: '#b47800' };
    const color = typeColors[type ?? 'suspect'] ?? '#ff2020';

    return (
        <aside className="blueprint-scroll" style={{ width: 240, flexShrink: 0, borderLeft: '1px solid rgba(185,28,28,0.25)', background: '#080808', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(185,28,28,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, background: color, borderRadius: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 'bold' }}>
                        {typeLabels[type ?? 'suspect'] ?? 'NODE'}
                    </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>ID:{id.slice(-6).toUpperCase()}</span>
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Node type specific info */}
                {Object.entries(data).map(([k, v]) => {
                    if (k === 'dbId' || typeof v === 'function') return null;
                    return (
                        <div key={k}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
                                {k}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: v === true ? '#50e050' : v === false ? '#ff6060' : 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                                {typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v || '—').slice(0, 120)}
                            </div>
                        </div>
                    );
                })}

                {/* Position */}
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
                        Position
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                        X: {Math.round(selectedNode.position.x)} | Y: {Math.round(selectedNode.position.y)}
                    </div>
                </div>
            </div>
        </aside>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// INNER CANVAS — needs useReactFlow, must be inside ReactFlowProvider
// ─────────────────────────────────────────────────────────────────────────────
function BlueprintCanvas({
    caseData,
    onNodeSelect,
    onSaveStatus,
    onGlitch,
}: {
    caseData: CaseData;
    onNodeSelect: (node: Node | null) => void;
    onSaveStatus: (s: 'idle' | 'saving' | 'saved') => void;
    onGlitch: () => void;
}) {
    const rfInstance = useReactFlow();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const uuid = caseData.id;
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Bootstrap nodes from DB or saved blueprint ─────────────
    useEffect(() => {
        if (caseData.blueprint_data?.nodes) {
            setNodes(caseData.blueprint_data.nodes);
            setEdges(caseData.blueprint_data.edges ?? []);
        } else {
            const newNodes: Node[] = [];
            let yS = 80, yT = 80, yC = 80;
            caseData.suspects.forEach(s => {
                newNodes.push({ id: `suspect-${s.id}`, type: 'suspect', position: { x: 80, y: yS }, data: { label: s.name, bio: s.bio, is_culprit: s.is_culprit, dbId: s.id } });
                yS += 180;
                s.statements.forEach(st => {
                    newNodes.push({ id: `stmt-${st.id}`, type: 'statement', position: { x: 380, y: yT }, data: { label: st.content, type: st.type, discovery_tier: st.discovery_tier, dbId: st.id } });
                    yT += 140;
                });
            });
            caseData.clues.forEach(c => {
                newNodes.push({ id: `clue-${c.id}`, type: 'clue', position: { x: 650, y: yC }, data: { label: c.name, description: c.description, clueType: c.type.toUpperCase(), discovery_tier: c.discovery_tier, dbId: c.id } });
                yC += 160;
            });
            setNodes(newNodes);
            setEdges([]);
        }
    }, [caseData]);

    // ── Auto-save ────────────────────────────────────────────────
    const triggerAutoSave = useCallback((n: Node[], e: Edge[]) => {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        onSaveStatus('saving');
        autoSaveTimer.current = setTimeout(async () => {
            try {
                await api.patch(`/v1/planner/${uuid}/save`, { blueprint_data: { nodes: n, edges: e } });
                onSaveStatus('saved');
                setTimeout(() => onSaveStatus('idle'), 2000);
            } catch { onSaveStatus('idle'); }
        }, 1500);
    }, [uuid, onSaveStatus]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes(nds => { const next = applyNodeChanges(changes, nds); triggerAutoSave(next, edges); return next; });
    }, [edges, triggerAutoSave]);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        setEdges(eds => { const next = applyEdgeChanges(changes, eds); triggerAutoSave(nodes, next); return next; });
    }, [nodes, triggerAutoSave]);

    const onConnect = useCallback((connection: Connection) => {
        const newEdge = {
            ...connection,
            animated: true,
            type: 'smoothstep',
            style: { stroke: '#ff2020', strokeWidth: 2 },
        };
        setEdges(eds => { const next = addEdge(newEdge, eds); triggerAutoSave(nodes, next); return next; });
    }, [nodes, triggerAutoSave]);

    const onNodeClick = useCallback((_: any, node: Node) => {
        onNodeSelect(node);
    }, [onNodeSelect]);

    const onPaneClick = useCallback(() => onNodeSelect(null), [onNodeSelect]);

    // ── Drag-and-Drop from sidebar ───────────────────────────────
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const nodeType = e.dataTransfer.getData('application/reactflow-type');
        if (!nodeType) return;

        const extraDataRaw = e.dataTransfer.getData('application/reactflow-data');
        const extraData = extraDataRaw ? JSON.parse(extraDataRaw) : {};

        // Convert screen coords → flow coords
        const { x, y } = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });

        const newNode: Node = {
            id: `${nodeType}-dropped-${Date.now()}`,
            type: nodeType,
            position: { x: x - 100, y: y - 60 },
            data: extraData,
        };

        setNodes(nds => {
            const next = [...nds, newNode];
            triggerAutoSave(next, edges);
            return next;
        });

        // Glitch effect on drop
        onGlitch();
    }, [rfInstance, edges, triggerAutoSave, onGlitch]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={{
                animated: true,
                type: 'smoothstep',
                style: { stroke: '#ff2020', strokeWidth: 2 },
            }}
            style={{ background: '#050505' }}
        >
            <Background color="rgba(185,28,28,0.08)" variant={BackgroundVariant.Lines} gap={40} />
            <Controls />
            <MiniMap
                nodeColor={n => n.type === 'suspect' ? '#ff2020' : n.type === 'clue' ? '#b47800' : '#408040'}
            />
        </ReactFlow>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION MODAL — với passed/errors list + Self-Solve prompt
// ─────────────────────────────────────────────────────────────────────────────
function ValidationModal({
    caseId, onClose, onPublished, onNeedSelfSolve,
}: {
    caseId: string;
    onClose: () => void;
    onPublished: () => void;
    onNeedSelfSolve: () => void;
}) {
    const [result, setResult] = useState<null | { valid: boolean; passed: string[]; errors: string[]; message: string }>(null);
    const [checking, setChecking] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const runCheck = async () => {
        setChecking(true);
        try {
            const res = await api.post(`/v1/planner/${caseId}/validate`);
            setResult({
                valid: res.data.valid,
                passed: res.data.passed ?? [],
                errors: res.data.errors ?? [],
                message: res.data.message ?? '',
            });
        } catch (e: any) {
            setResult({ valid: false, passed: [], errors: [e?.response?.data?.message ?? 'Validation error'], message: '' });
        } finally { setChecking(false); }
    };

    useEffect(() => { runCheck(); }, [caseId]);

    const handlePublish = async () => {
        setPublishing(true);
        try {
            await api.post(`/v1/planner/${caseId}/publish`);
            onPublished();
            onClose();
        } catch (e: any) {
            const errMsg = e?.response?.data?.message ?? 'Publish error';
            setResult(prev => prev ? { ...prev, valid: false, errors: [errMsg] } : null);
        } finally { setPublishing(false); }
    };

    const needsSelfSolve = result?.errors?.some(e => e.includes('Self-Solve'));

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
            <div style={{ width: 520, background: '#0a0a0a', border: '1px solid rgba(255,32,32,0.4)', boxShadow: '0 0 60px rgba(255,32,32,0.15)' }}>
                {/* Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,32,32,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff2020', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        ⚡ Isolation Check
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={runCheck} disabled={checking} style={{ background: 'none', border: '1px solid rgba(255,32,32,0.3)', color: 'rgba(255,32,32,0.6)', fontFamily: 'var(--font-mono)', fontSize: 8, padding: '3px 8px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {checking ? '...' : 'RE-RUN'}
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 20, cursor: 'pointer', lineHeight: 1, paddingBottom: 2 }}>×</button>
                    </div>
                </div>

                <div style={{ padding: '20px 24px' }}>
                    {checking ? (
                        <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,32,32,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                            [ SCANNING LOGIC GRAPH... ]
                        </div>
                    ) : result ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Passed checks */}
                            {result.passed.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {result.passed.map((p, i) => (
                                        <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(80,200,80,0.85)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                            <span style={{ color: 'rgba(80,200,80,0.5)', flexShrink: 0 }}>✓</span>
                                            <span>{p.replace(/^✓\s*/, '')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Failed checks */}
                            {result.errors.length > 0 && (
                                <div style={{ background: 'rgba(255,32,32,0.04)', border: '1px solid rgba(255,32,32,0.2)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {result.errors.map((err, i) => {
                                        const isSelfSolve = err.includes('Self-Solve');
                                        return (
                                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#ff4040', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 11 }}>✗</span>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isSelfSolve ? '#ff8080' : '#ff6060', lineHeight: 1.6 }}>{err}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* CTA Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                {needsSelfSolve && (
                                    <button
                                        onClick={() => { onClose(); onNeedSelfSolve(); }}
                                        style={{ width: '100%', background: 'rgba(255,32,32,0.1)', color: '#ff6060', border: '1px solid rgba(255,32,32,0.4)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,32,32,0.2)'; e.currentTarget.style.borderColor = '#ff2020'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,32,32,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,32,32,0.4)'; }}
                                    >
                                        🧪 START SELF-SOLVE
                                    </button>
                                )}

                                {result.valid && (
                                    <button
                                        onClick={handlePublish}
                                        disabled={publishing}
                                        style={{ width: '100%', background: '#ff2020', color: '#fff', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '14px', cursor: 'pointer', boxShadow: '0 0 24px rgba(255,32,32,0.5)', transition: 'box-shadow 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(255,32,32,0.8)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(255,32,32,0.5)'}
                                    >
                                        {publishing ? '[ DEPLOYING... ]' : '💀 PUBLISH THE OPERATION'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SELF-SOLVE OVERLAY — Criminal tự phá án của mình
// ─────────────────────────────────────────────────────────────────────────────
function SelfSolveOverlay({
    caseData,
    onClose,
    onSolved,
}: {
    caseData: CaseData;
    onClose: () => void;
    onSolved: () => void;
}) {
    const [accused, setAccused] = useState<string | null>(null);
    const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAccuse = async (suspectId: string) => {
        setAccused(suspectId);
        setLoading(true);
        try {
            const res = await api.post(`/v1/planner/${caseData.id}/self-solve`, {
                accused_suspect_id: suspectId,
            });
            setResult({ correct: res.data.correct, message: res.data.message });
            if (res.data.correct) {
                setTimeout(() => onSolved(), 2000);
            }
        } catch (e: any) {
            setResult({ correct: false, message: e?.response?.data?.message ?? 'Error' });
        } finally { setLoading(false); }
    };

    return (
        <div className="self-solve-overlay">
            {/* Header */}
            <div className="self-solve-header">Self-Solve Protocol</div>

            <div className="self-solve-title">Who did it?</div>

            <div className="self-solve-subtitle">
                Prove you understand your own heist.<br />
                Select the guilty party to confirm.
            </div>

            {/* Suspect grid — names only, no culprit reveal */}
            {!result && (
                <div className="suspect-accusation-grid">
                    {caseData.suspects.map((s, i) => (
                        <button
                            key={s.id}
                            className={`suspect-accusation-card${accused === s.id ? ' accused' : ''}`}
                            onClick={() => handleAccuse(s.id)}
                            disabled={loading}
                            style={{ border: 'none', textAlign: 'left', width: '100%' }}
                        >
                            <span className="card-id">SUS-{String(i + 1).padStart(3, '0')}</span>
                            <span className="card-name">{s.name}</span>
                            <span className="card-bio">{(s.bio || '').slice(0, 60)}{s.bio && s.bio.length > 60 ? '...' : ''}</span>
                            {accused === s.id && loading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ff2020', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                    VERIFYING...
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Result */}
            {result && (
                <div style={{ maxWidth: 400, padding: '24px', border: `1px solid ${result.correct ? 'rgba(80,200,80,0.4)' : 'rgba(255,32,32,0.4)'}`, background: result.correct ? 'rgba(80,200,80,0.06)' : 'rgba(255,32,32,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{result.correct ? '✓' : '✗'}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: result.correct ? 'rgba(80,200,80,0.9)' : '#ff6060', lineHeight: 1.7 }}>
                        {result.message}
                    </div>
                    {result.correct && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(80,200,80,0.5)', marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            Returning to blueprint...
                        </div>
                    )}
                    {!result.correct && (
                        <button
                            onClick={() => { setResult(null); setAccused(null); }}
                            style={{ marginTop: 16, background: 'none', border: '1px solid rgba(255,32,32,0.4)', color: 'rgba(255,32,32,0.7)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '8px 20px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                        >
                            Try Again
                        </button>
                    )}
                </div>
            )}

            {/* Cancel */}
            {!result && (
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 8 }}
                >
                    ← Cancel / Back to Blueprint
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISH STAMP — "HEIST PUBLISHED" victory animation
// ─────────────────────────────────────────────────────────────────────────────
function PublishStamp({ onDone }: { onDone: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div className="publish-overlay">
            <div className="publish-stamp">
                <span className="publish-stamp-text">HEIST PUBLISHED</span>
                <span className="publish-stamp-sub">Operation is live — detectives incoming</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function BlueprintPageInner() {
    const params = useParams();
    const router = useRouter();
    const uuid = params?.uuid as string;

    const [caseData, setCaseData] = useState<CaseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showValidation, setShowValidation] = useState(false);
    const [showSelfSolve, setShowSelfSolve] = useState(false);
    const [showPublishStamp, setShowPublishStamp] = useState(false);
    const [glitch, setGlitch] = useState(false);
    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);

    const fetchCase = useCallback(async () => {
        try {
            const res = await api.get(`/v1/planner/${uuid}`);
            setCaseData(res.data);
            setTitle(res.data.title);
        } finally { setLoading(false); }
    }, [uuid]);

    useEffect(() => { fetchCase(); }, [fetchCase]);

    const handlePublished = useCallback(() => {
        setShowPublishStamp(true);
        fetchCase();
    }, [fetchCase]);

    const handleSelfSolved = useCallback(() => {
        setShowSelfSolve(false);
        fetchCase();
    }, [fetchCase]);

    const handleGlitch = useCallback(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 500);
    }, []);

    const handleSaveTitle = useCallback(async () => {
        setEditingTitle(false);
        if (!title.trim() || title === caseData?.title) return;
        try {
            await api.patch(`/v1/planner/${uuid}/save`, { title });
            setCaseData(prev => prev ? { ...prev, title } : prev);
        } catch { }
    }, [uuid, title, caseData?.title]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff2020', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                    [ DECRYPTING OPERATION... ]
                </div>
            </div>
        );
    }
    if (!caseData) return null;

    return (
        <div
            className={`blueprint-cursor blueprint-mode${glitch ? ' glitch-active' : ''}`}
            style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#050505', color: '#f2f2f2', overflow: 'hidden' }}
        >
            {/* Victory Stamp */}
            {showPublishStamp && (
                <PublishStamp onDone={() => { setShowPublishStamp(false); router.push('/planner'); }} />
            )}

            {/* Self-Solve Overlay */}
            {showSelfSolve && (
                <SelfSolveOverlay
                    caseData={caseData}
                    onClose={() => setShowSelfSolve(false)}
                    onSolved={handleSelfSolved}
                />
            )}

            {/* Validation Modal */}
            {showValidation && (
                <ValidationModal
                    caseId={caseData.id}
                    onClose={() => setShowValidation(false)}
                    onPublished={handlePublished}
                    onNeedSelfSolve={() => setShowSelfSolve(true)}
                />
            )}

            {/* ════ CONTROL BAR ════════════════════════════════════════════ */}
            <header style={{
                height: 56, flexShrink: 0,
                borderBottom: '1px solid rgba(185,28,28,0.3)',
                background: 'rgba(5,5,5,0.98)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center',
                padding: '0 20px', gap: 16, zIndex: 10,
            }}>
                {/* Brand & back */}
                <button
                    onClick={() => router.push('/planner')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,32,32,0.5)', fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'color 0.15s', padding: '4px 0' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff2020'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,32,32,0.5)'}
                >
                    ← LAIR
                </button>

                <div style={{ width: 1, height: 20, background: 'rgba(185,28,28,0.3)' }} />

                {/* Editable title */}
                {editingTitle ? (
                    <input
                        autoFocus
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') { setTitle(caseData.title); setEditingTitle(false); } }}
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #ff2020', color: '#f2f2f2', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', outline: 'none', width: 300 }}
                    />
                ) : (
                    <span
                        onClick={() => setEditingTitle(true)}
                        title="Click to rename"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#f2f2f2', cursor: 'text', borderBottom: '1px solid transparent', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderBottomColor = 'rgba(255,32,32,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                    >
                        {caseData.title}
                    </span>
                )}

                {/* Status badge */}
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 'bold',
                    textTransform: 'uppercase', letterSpacing: '0.2em',
                    padding: '2px 8px',
                    border: `1px solid ${caseData.status === 'published' ? 'rgba(80,200,80,0.4)' : 'rgba(185,28,28,0.4)'}`,
                    color: caseData.status === 'published' ? 'rgba(80,200,80,0.8)' : 'rgba(255,32,32,0.7)',
                }}>
                    {caseData.status.toUpperCase()}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Save status */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: saveStatus === 'saved' ? 'rgba(80,200,80,0.7)' : saveStatus === 'saving' ? 'rgba(255,32,32,0.5)' : 'transparent', minWidth: 64, textAlign: 'center', transition: 'color 0.3s' }}>
                    {saveStatus === 'saving' ? '[ SAVING ]' : saveStatus === 'saved' ? '✓ SAVED' : ''}
                </div>

                {/* Actions */}
                <button
                    onClick={() => setShowValidation(true)}
                    style={{ background: 'none', border: '1px solid rgba(185,28,28,0.5)', color: 'rgba(255,32,32,0.8)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,32,32,0.1)'; e.currentTarget.style.borderColor = '#ff2020'; e.currentTarget.style.color = '#ff2020'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(185,28,28,0.5)'; e.currentTarget.style.color = 'rgba(255,32,32,0.8)'; }}
                >
                    ⚡ VALIDATE
                </button>
                <button
                    style={{ background: '#ff2020', color: '#fff', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '7px 18px', cursor: 'pointer', boxShadow: '0 0 14px rgba(255,32,32,0.35)', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(255,32,32,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 14px rgba(255,32,32,0.35)'}
                    onClick={() => setShowValidation(true)}
                >
                    PUBLISH HEIST
                </button>
            </header>

            {/* ════ MAIN CONTENT ═══════════════════════════════════════════ */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left: Asset Library */}
                <AssetLibrary caseData={caseData} onRefresh={fetchCase} />

                {/* Center: Blueprint Canvas */}
                <main className="blueprint-grid" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {/* TOP SECRET watermark */}
                    <div className="blueprint-watermark">
                        <span>TOP SECRET</span>
                    </div>

                    {/* React Flow */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                        <BlueprintCanvas
                            caseData={caseData}
                            onNodeSelect={setSelectedNode}
                            onSaveStatus={setSaveStatus}
                            onGlitch={handleGlitch}
                        />
                    </div>

                    {/* Help hint */}
                    <div style={{
                        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                        fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.12)',
                        textTransform: 'uppercase', letterSpacing: '0.2em',
                        pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap',
                    }}>
                        [ DRAG ASSETS FROM LIBRARY · CONNECT HANDLES TO WIRE CONTRADICTIONS ]
                    </div>
                </main>

                {/* Right: Properties Panel */}
                <PropertiesPanel selectedNode={selectedNode} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — wrapped in ReactFlowProvider (required for useReactFlow)
// ─────────────────────────────────────────────────────────────────────────────
export default function BlueprintPage() {
    return (
        <ReactFlowProvider>
            <BlueprintPageInner />
        </ReactFlowProvider>
    );
}
