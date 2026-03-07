import { Handle, Position } from '@xyflow/react';

export const StatementNode = ({ data }: any) => {
    return (
        <div style={{
            backgroundColor: '#fff', border: '2px solid #000', padding: '12px',
            width: '224px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', position: 'relative'
        }}>
            <div style={{
                position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%) rotate(45deg)',
                width: '16px', height: '16px', backgroundColor: '#000'
            }} />

            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontStyle: 'italic',
                marginBottom: '4px', color: '#64748b'
            }}>
                {data.suspectName} says:
            </div>
            <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500, color: 'var(--charcoal)', lineHeight: 1.5
            }}>
                "{data.content}"
            </p>

            <Handle
                type="target"
                position={Position.Left}
                style={{
                    width: '12px', height: '12px', backgroundColor: '#000', border: '2px solid #fff', borderRadius: 0
                }}
            />
        </div>
    );
};
