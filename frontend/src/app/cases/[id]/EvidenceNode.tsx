import { Handle, Position } from '@xyflow/react';

export const EvidenceNode = ({ data }: any) => {
  return (
    <div className="torn-paper noir-grain" style={{ padding: '16px', width: '192px', position: 'relative' }}>
      {/* Cái ghim (Pin) */}
      <div style={{
        position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
        width: '12px', height: '12px', backgroundColor: '#991b1b', borderRadius: '50%',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', zIndex: 10
      }} />
      
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
        borderBottom: '1px solid rgba(0,0,0,0.2)', marginBottom: '8px', opacity: 0.6
      }}>
        Evidence #{data.id ? data.id.toString().slice(0, 4) : '0000'}
      </div>
      
      <h4 style={{
        fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase',
        lineHeight: 1.25, marginBottom: '4px', fontFamily: 'var(--font-body)', color: 'var(--charcoal)'
      }}>
        {data.title}
      </h4>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '11px', lineHeight: 1.375, color: 'var(--charcoal)'
      }}>
        {data.description}
      </p>

      {/* Điểm kết nối - chỉ cho phép kéo ra từ đây */}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{
          width: '12px', height: '12px', backgroundColor: '#b91c1c', border: '2px solid #000'
        }}
      />
    </div>
  );
};
