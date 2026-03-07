'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    data: any;
    read_at: string | null;
    created_at: string;
}

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: notifications = [] } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: () => api.get('/v1/notifications').then(res => res.data),
        enabled: isOpen,
        refetchInterval: 30000,
    });

    const { data: unreadData } = useQuery<{ unread_count: number }>({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => api.get('/v1/notifications/unread-count').then(res => res.data),
        refetchInterval: 15000,
    });

    const markReadMutation = useMutation({
        mutationFn: (id: number) => api.post(`/v1/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = unreadData?.unread_count || 0;

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: unreadCount > 0 ? '2px solid var(--red-bright)' : '2px solid var(--charcoal)',
                    color: unreadCount > 0 ? 'var(--red-bright)' : 'var(--charcoal)',
                    padding: '4px 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: unreadCount > 0 ? '0 0 10px rgba(185, 28, 28, 0.4)' : 'none',
                    animation: unreadCount > 0 ? 'pulse-alert 2s infinite' : 'none'
                }}
            >
                {unreadCount > 0 && <span className="blink-text">[ ! ]</span>}
                NOTIFICATIONS
                {unreadCount > 0 && <span>({unreadCount})</span>}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    backgroundColor: 'var(--paper)',
                    border: '3px solid var(--charcoal)',
                    boxShadow: '10px 10px 0 var(--charcoal)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '12px',
                        background: 'var(--charcoal)',
                        color: 'var(--paper)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em'
                    }}>
                        TELETYPE INTERFACE — RECENT INTEL
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-light)', fontSize: '11px', fontStyle: 'italic' }}>
                                NO NEW INTEL SECURED.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => !notif.read_at && markReadMutation.mutate(notif.id)}
                                    style={{
                                        padding: '12px',
                                        borderBottom: '1px solid var(--border-light)',
                                        backgroundColor: notif.read_at ? 'transparent' : 'rgba(185, 28, 28, 0.05)',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {!notif.read_at && (
                                        <div style={{
                                            position: 'absolute', top: '12px', left: '0',
                                            width: '3px', height: '20px', background: 'var(--red-bright)'
                                        }} />
                                    )}
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '9px',
                                        color: notif.type === 'TAUNT' ? 'var(--red-bright)' : 'var(--evidence-tag)',
                                        fontWeight: 'bold',
                                        marginBottom: '4px'
                                    }}>
                                        [{notif.type}]
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '13px',
                                        fontWeight: 900,
                                        marginBottom: '4px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {notif.title}
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '11px',
                                        color: 'var(--ink)',
                                        lineHeight: '1.4'
                                    }}>
                                        {notif.message}
                                    </div>
                                    <div style={{
                                        marginTop: '8px',
                                        fontSize: '8px',
                                        color: 'var(--ink-light)',
                                        textAlign: 'right'
                                    }}>
                                        {new Date(notif.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes pulse-alert {
                    0% { box-shadow: 0 0 0px var(--red-bright); }
                    50% { box-shadow: 0 0 15px var(--red-bright); }
                    100% { box-shadow: 0 0 0px var(--red-bright); }
                }
            `}</style>
        </div>
    );
}
