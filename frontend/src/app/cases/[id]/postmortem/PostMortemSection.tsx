'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Comment {
    id: number;
    user_name: string;
    content: string;
    created_at: string;
}

export default function PostMortemSection({ caseId }: { caseId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await api.get(`/v1/cases/${caseId}/comments`);
                setComments(res.data);
            } catch (error) {
                console.error('Failed to load comments', error);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [caseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await api.post(`/v1/cases/${caseId}/comments`, {
                content: newComment,
            });
            setComments([res.data.comment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-12 mb-8 bg-[#1a1a1a] p-6 text-[#f2f0e9] border-t-[8px] border-[#8b1a1a]">
            {/* Header */}
            <h2 className="text-2xl font-bold uppercase tracking-widest font-mono mb-2">
                ▌ THE POST-MORTEM (KẾT LUẬN VÀ PHÂN TÍCH)
            </h2>
            <p className="text-sm font-mono text-[#aaa] mb-6 italic tracking-widest">
                Khu vực Thám Tử và Tội Phạm thảo luận sau khi chân tướng phơi bày.
            </p>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-[#2d2d2d] border-2 border-[#555] text-[#f2f0e9] p-4 font-mono text-sm focus:outline-none focus:border-[#c41e1e] placeholder-[#666] resize-none"
                    rows={3}
                    placeholder="Để lại lời nhắn cho Tác giả vụ án..."
                />
                <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="mt-3 bg-[#c41e1e] hover:bg-[#8b1a1a] text-white px-6 py-2 font-bold font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'PROCESSING...' : 'GỬI ĐÁNH GIÁ'}
                </button>
            </form>

            {/* Comment List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center font-mono text-[#555]">[ LOADING RECORDS... ]</div>
                ) : comments.length === 0 ? (
                    <div className="text-center font-mono text-[#555] italic">[ CHƯA CÓ BÀN LUẬN NÀO... ]</div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="border-l-4 border-[#c41e1e] pl-4 py-2 bg-[#252525]">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="font-bold text-[#f5f0d0] font-mono text-sm">{comment.user_name}</span>
                                <span className="text-xs text-[#888] font-mono">{comment.created_at}</span>
                            </div>
                            <p className="font-body text-sm leading-relaxed text-[#ddd] break-words">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
