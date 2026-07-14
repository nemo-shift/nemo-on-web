'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * DebugConsole — 모바일 실기기 디버깅용 콘솔 오버레이
 * - 화면 우하단 고정 버튼으로 토글
 * - console.log/warn/error 를 인터셉트해 화면에 표시
 * - 전체 복사 버튼 제공
 * - 진단 완료 후 HomeStage에서 제거할 것
 */
export default function DebugConsole() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const push = (prefix: string, args: unknown[]) => {
      const line = `[${prefix}] ${args.map(a => {
        try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
        catch { return String(a); }
      }).join(' ')}`;
      setLogs(prev => [...prev, line]);
    };

    const origLog   = console.log.bind(console);
    const origWarn  = console.warn.bind(console);
    const origError = console.error.bind(console);

    console.log   = (...args) => { origLog(...args);   push('LOG',   args); };
    console.warn  = (...args) => { origWarn(...args);  push('WARN',  args); };
    console.error = (...args) => { origError(...args); push('ERR',   args); };

    return () => {
      console.log   = origLog;
      console.warn  = origWarn;
      console.error = origError;
    };
  }, []);

  // 새 로그 추가 시 맨 아래 자동 스크롤
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n')).catch(() => {
      // clipboard API 미지원 시 fallback
      const ta = document.createElement('textarea');
      ta.value = logs.join('\n');
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  };

  return (
    <>
      {/* 토글 버튼 */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 99999,
          background: '#0891b2',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 14px',
          fontSize: 13,
          fontFamily: 'monospace',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      >
        {open ? '콘솔 닫기' : `콘솔 (${logs.length})`}
      </button>

      {/* 로그 오버레이 */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 130,
            right: 16,
            left: 16,
            zIndex: 99998,
            background: 'rgba(10,10,10,0.95)',
            border: '1px solid #333',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '55vh',
            boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          }}
        >
          {/* 헤더 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            borderBottom: '1px solid #333',
          }}>
            <span style={{ color: '#888', fontSize: 12, fontFamily: 'monospace' }}>
              Debug Console — {logs.length}줄
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setLogs([])}
                style={{
                  background: '#333',
                  color: '#aaa',
                  border: 'none',
                  borderRadius: 5,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                지우기
              </button>
              <button
                onClick={handleCopy}
                style={{
                  background: '#0891b2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 5,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                전체 복사
              </button>
            </div>
          </div>

          {/* 로그 목록 */}
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 12px',
              fontFamily: 'monospace',
              fontSize: 11,
              lineHeight: 1.6,
              color: '#d4d4d4',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {logs.length === 0
              ? <span style={{ color: '#555' }}>로그 없음</span>
              : logs.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      color: l.startsWith('[ERR]') ? '#f87171'
                           : l.startsWith('[WARN]') ? '#fbbf24'
                           : '#d4d4d4',
                      borderBottom: '1px solid #1a1a1a',
                      paddingBottom: 2,
                      marginBottom: 2,
                    }}
                  >
                    {l}
                  </div>
                ))
            }
          </div>
        </div>
      )}
    </>
  );
}
