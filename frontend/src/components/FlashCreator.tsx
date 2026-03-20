'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function FlashCreator() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [options, setOptions] = useState(['', '', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [explanation, setExplanation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/v1/flash-cases', {
                title,
                description,
                image_url: imageUrl || null,
                options,
                correct_index: correctIndex,
                explanation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 201) {
                alert('Flash Mystery Published! 🕵️‍♂️');
                router.push('/agency'); // Redirect to agency or a specific flash feed
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to publish mystery.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    return (
        <div style={{
            maxWidth: '500px',
            margin: '40px auto',
            padding: '32px',
            backgroundColor: 'var(--paper)',
            border: '6px solid var(--charcoal)',
            fontFamily: 'var(--font-mono)',
            boxShadow: '20px 20px 0px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{
                fontSize: '24px',
                fontWeight: '900',
                marginBottom: '24px',
                borderBottom: '4px solid var(--charcoal)',
                paddingBottom: '8px',
                textTransform: 'uppercase'
            }}>
                [ THE FLASH CREATOR ]
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && <div style={{ color: 'var(--red)', fontSize: '12px', fontWeight: 'bold' }}>!! {error}</div>}

                <div>
                    <label style={{ display: 'block', fontSize: '10px', marginBottom: '4px', opacity: 0.6 }}>CASE_TITLE</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. The Frozen Glass Mystery"
                        required
                        style={{ width: '100%', padding: '10px', border: '2px solid var(--charcoal)', backgroundColor: 'transparent', outline: 'none' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '10px', marginBottom: '4px', opacity: 0.6 }}>MYSTERY_DESCRIPTION</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe the scene and the logical flaw..."
                        required
                        rows={4}
                        style={{ width: '100%', padding: '10px', border: '2px solid var(--charcoal)', backgroundColor: 'transparent', outline: 'none', resize: 'none' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '10px', marginBottom: '4px', opacity: 0.6 }}>EVIDENCE_IMAGE_URL (OPTIONAL)</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '10px', border: '2px solid var(--charcoal)', backgroundColor: 'transparent', outline: 'none' }}
                    />
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--paper-dark)', border: '1px dashed var(--charcoal)' }}>
                    <label style={{ display: 'block', fontSize: '10px', marginBottom: '12px', fontWeight: 'bold' }}>POSSIBLE_ANSWERS</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {options.map((opt, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    name="correct"
                                    checked={correctIndex === idx}
                                    onChange={() => setCorrectIndex(idx)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(idx, e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                    required
                                    style={{ flex: 1, padding: '8px', border: '1px solid var(--charcoal)', backgroundColor: 'var(--paper)', outline: 'none', fontSize: '12px' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '10px', marginBottom: '4px', opacity: 0.6 }}>THE_LOGICAL_TRUTH (EXPLANATION)</label>
                    <textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Explain why the answer is correct..."
                        required
                        rows={3}
                        style={{ width: '100%', padding: '10px', border: '2px solid var(--charcoal)', backgroundColor: 'transparent', outline: 'none', resize: 'none' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        backgroundColor: 'var(--charcoal)',
                        color: '#fff',
                        padding: '14px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginTop: '10px',
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? 'TRANSMITTING...' : 'PUBLISH FLASH MYSTERY'}
                </button>
            </form>
        </div>
    );
}
