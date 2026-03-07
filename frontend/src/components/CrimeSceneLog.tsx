'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';

interface Comment {
    id: number;
    user_name: string;
    user_rank: string;
    content: string;
    status_at_comment: string;
    solve_time: number | null;
    created_at: string;
}

export default function CrimeSceneLog({ caseId }: { caseId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const typingSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        typingSoundRef.current = new Audio('/sounds/typewriter-key.mp3');
        typingSoundRef.current.volume = 0.2;
    }, []);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/v1/cases/${caseId}/comments`);
            setComments(res.data);
            setError('');
        } catch (err: any) {
            if (err.response?.status === 403) {
                setError("CLASSIFIED: SOLVE THE CASE TO VIEW THE CRIME SCENE LOG.");
            } else {
                setError("FAILED TO RETRIEVE LOGS.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [caseId]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (typingSoundRef.current && e.key !== 'Enter' && e.key !== 'Backspace') {
            typingSoundRef.current.currentTime = 0;
            typingSoundRef.current.play().catch(() => { });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await api.post(`/v1/cases/${caseId}/comments`, { content });
            setContent('');
            fetchComments();

            // Play a ding/stamp sound on submit if available
            const stampSound = new Audio('/sounds/stamp.mp3');
            stampSound.volume = 0.5;
            stampSound.play().catch(() => { });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error posting comment.');
        }
    };

    if (loading) return <div className="corkboard-loading">[ LOADING CRIME SCENE LOG... ]</div>;

    if (error) return (
        <div className="corkboard-restricted">
            <span className="restricted-icon">⚠️</span>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="corkboard-container">
            <div className="corkboard-header">
                <h2>THE CRIME SCENE LOG</h2>
                <div className="corkboard-subtitle">POST-MORTEM DEBRIEFING</div>
            </div>

            <div className="corkboard-notes">
                {comments.map((comment, index) => {
                    const isSolved = comment.status_at_comment === 'SOLVED';
                    const isAuthor = comment.status_at_comment === 'AUTHOR';
                    const isFailed = comment.status_at_comment === 'FAILED';

                    let noteClass = 'sticky-note note-failed';
                    let stampText = 'VICTIM';
                    let stampClass = 'stamp-victim';

                    if (isSolved) {
                        noteClass = 'sticky-note note-solved';
                        stampText = 'VERIFIED';
                        stampClass = 'stamp-verified';
                    } else if (isAuthor) {
                        noteClass = 'sticky-note note-author';
                        stampText = 'MASTERMIND';
                        stampClass = 'stamp-mastermind';
                    }

                    // Random slightly skewed rotation for realism (seeded by index so it stays consistent)
                    const rotation = (index % 5) * 2 - 4; // -4 to 4 degrees

                    return (
                        <div key={comment.id} className={noteClass} style={{ transform: `rotate(${rotation}deg)` }}>
                            <div className="note-pin"></div>

                            <div className={`note-stamp ${stampClass}`}>
                                [{stampText}]
                            </div>

                            <div className="note-header">
                                <span className="note-author-name">
                                    [{comment.user_rank}] {comment.user_name}
                                </span>
                                <span className="note-time">{comment.created_at}</span>
                            </div>

                            <div className="note-content">
                                {comment.content}
                            </div>

                            {isSolved && comment.solve_time && (
                                <div className="note-footer text-ink-light">
                                    SOLVE TIME: {Math.floor(comment.solve_time / 60)}m {comment.solve_time % 60}s
                                </div>
                            )}
                        </div>
                    );
                })}

                {comments.length === 0 && (
                    <div className="corkboard-empty">No notes found. Be the first to leave a mark.</div>
                )}
            </div>

            <form className="corkboard-form" onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Leave a note at the crime scene..."
                    disabled={false}
                    maxLength={1000}
                />
                <div className="corkboard-form-actions">
                    <span className="char-count">{content.length}/1000</span>
                    <button type="submit" disabled={!content.trim()}>PIN NOTE</button>
                </div>
            </form>
        </div>
    );
}
